"""
Prepare a clean 10-second 24kHz mono WAV reference clip from the 2-minute MP3 sample
for optimal F5-TTS zero-shot voice cloning on RTX 3050 4GB.
"""
import os
import shutil
import subprocess
import imageio_ffmpeg

SRC_MP3 = r"D:\download\audio [vocals].mp3"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference")
OUT_WAV = os.path.join(OUT_DIR, "watcher_ref.wav")
OUT_FULL = os.path.join(OUT_DIR, "source_full.mp3")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    if not os.path.exists(OUT_FULL) and os.path.exists(SRC_MP3):
        shutil.copy2(SRC_MP3, OUT_FULL)

    src = OUT_FULL if os.path.exists(OUT_FULL) else SRC_MP3
    if not os.path.exists(src):
        raise FileNotFoundError(f"Reference MP3 not found: {src}")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    venv_ffmpeg = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts", "ffmpeg.exe")
    if os.path.isdir(os.path.dirname(venv_ffmpeg)) and not os.path.exists(venv_ffmpeg):
        shutil.copy2(ffmpeg_exe, venv_ffmpeg)
        print(f"Installed ffmpeg.exe into {venv_ffmpeg}")
    # Extract 10 seconds starting at 00:00:05 (skip initial silence/breath), 24kHz mono PCM
    # Also apply mild loudnorm + highpass so F5-TTS gets crisp vocal timbre
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", "5",
        "-t", "10",
        "-i", src,
        "-ac", "1",
        "-ar", "24000",
        "-af", "highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11",
        OUT_WAV,
    ]
    subprocess.run(cmd, check=True)
    print(f"Prepared reference clip: {OUT_WAV}")


if __name__ == "__main__":
    main()
