const prompt=require("prompt-sync")({sigint:true});
const puppeteer = require('puppeteer');
const fs = require('fs');
const ytdl = require('ytdl-core');

const searchTermCLI = process.argv[2];

async function getLink() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://www.youtube.com');
    await page.waitForSelector('#search-input #search');
    let searchTerm = prompt("Please enter the title of the song you want to download: ");
    await page.type('#search-input #search', searchTerm);
    await Promise.all([
        page.waitForNavigation(),
        page.click('#search-icon-legacy'),
    ]);
    await page.waitForSelector('ytd-video-renderer');
    const videoTitle = await page.$eval('ytd-video-renderer h3 a#video-title', (elem) => {
        return elem.innerText;
    });
    console.log({ videoTitle });
    await Promise.all([
        page.waitForNavigation(),
        page.click('ytd-video-renderer h3 a#video-title'),
    ]);
    const videoUrl = page.url();
    await browser.close();
    console.log({ videoUrl });

    return [videoUrl, videoTitle];

}
getLink().then(([videoUrl, videoTitle]) => {
    async function download() {
        if (!videoUrl || !videoUrl.startsWith('https://www.youtube.com/watch?v=')) {
            console.log('Invalid url');
            return;
        }
        const info = await ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const bestAudioFormat = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });
        const fileStream = ytdl(videoUrl, { format: bestAudioFormat });
        let filepath = prompt("Please enter the filepath in where you want to store the song: ");
        // const fileName = `/Users/nisoeung/Music/Music/${videoTitle}.mp3`;
        const fileName = `${filepath}${videoTitle}.mp3`.replace(/\s/g, '_');
        fileStream.pipe(fs.createWriteStream(fileName));
        fileStream.on('end', function () {
            console.log('Download finished: ' + fileName);
        });
    }
    download();
});
