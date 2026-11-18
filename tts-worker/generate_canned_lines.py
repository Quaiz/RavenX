"""
Pre-generate static Watcher Handler voice lines for instant 0ms playback
on notifications, threat alerts, and key tactical UI interactions.
Outputs WAV clips to tactical-ui/public/sounds/voice/.
"""
import os
import soundfile as sf
import numpy as np
import torch

_venv_scripts = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts")
if os.path.isdir(_venv_scripts) and _venv_scripts not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _venv_scripts + os.pathsep + os.environ.get("PATH", "")

from f5_tts.api import F5TTS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO = os.path.join(BASE_DIR, "reference", "watcher_ref.wav")
OUT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "tactical-ui", "public", "sounds", "voice"))

VOICE_LINES = {
    "comms_online": "Watcher to Operator. Comms online. All sensor grids active.",
    "alert_critical": "Priority alert. High-severity threat detected on the grid.",
    "alert_seismic": "Seismic anomaly detected. Updating global fault telemetry.",
    "airspace_scan": "Scanning global airspace. Tracking ADS-B transponders.",
    "maritime_alert": "Maritime chokepoint telemetry acquired.",
    "target_locked": "Target dossier acquired. Analyzing intelligence.",
    "briefing_ready": "Watcher to Operator. Tactical briefing ready.",
    "sector_focused": "Sector coordinates locked.",
    "comms_muted": "Voice comms offline.",
}


def main():
    if not os.path.exists(REF_AUDIO):
        raise FileNotFoundError(f"Run prepare_reference.py first. Missing: {REF_AUDIO}")

    os.makedirs(OUT_DIR, exist_ok=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Loading F5-TTS on {device}...")
    tts = F5TTS(device=device)

    for clip_id, text in VOICE_LINES.items():
        out_path = os.path.join(OUT_DIR, f"{clip_id}.wav")
        print(f"Generating {clip_id}.wav -> {text}")
        with torch.inference_mode():
            wav, sr, _ = tts.infer(
                ref_file=REF_AUDIO,
                ref_text="",
                gen_text=text,
                speed=1.05,
                nfe_step=24,  # Higher quality for static pre-rendered clips
            )
        sf.write(out_path, np.asarray(wav, dtype=np.float32), sr, format="WAV")

    print(f"Done! Generated {len(VOICE_LINES)} voice clips in {OUT_DIR}")


if __name__ == "__main__":
    main()
