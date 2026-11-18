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
    # Extract 12.0 seconds (23.0s -> 35.0s, clean female narration) with gentle 70Hz highpass
    cmd = [
        ffmpeg_exe,
        "-y",
        "-ss", "23.0",
        "-t", "12.0",
        "-i", src,
        "-af", "highpass=f=70",
        "-ac", "1",
        "-ar", "24000",
        OUT_WAV,
    ]
    subprocess.run(cmd, check=True)
    # Peak-normalize to -1 dBFS (0.90) float32 so voice cloning has crisp, full dynamics
    import numpy as np
    import soundfile as sf
    wav, sr = sf.read(OUT_WAV, dtype="float32")
    peak = float(np.max(np.abs(wav)))
    if peak > 1e-6:
        wav = wav / peak * 0.90
    sf.write(OUT_WAV, wav.astype(np.float32), sr, format="WAV")
    print(f"Prepared normalized reference clip: {OUT_WAV} (sr={sr}, peak=0.90)")


if __name__ == "__main__":
    main()
