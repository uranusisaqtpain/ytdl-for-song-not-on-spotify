import os
import sys

if not os.path.exists("audio_files"):
    os.mkdir("audio_files")
videoUrl = sys.argv[1]

def download(link):
    import yt_dlp as ydl

    ydl_opts = {
        'ignoreerrors': True,
        "format": "bestaudio/best",
        "outtmpl": "/audio_file_path/%(title)s.%(ext)s",
        "extractaudio": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
        "noplaylist": False,
        "download": True,
    }
    with ydl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([link])


if __name__ == '__main__':
    download(videoUrl)
    sys.stdout.flush()
