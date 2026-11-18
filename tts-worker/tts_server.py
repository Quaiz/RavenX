"""
RavenX Local GPU TTS Worker (F5-TTS on RTX 3050 4GB).
Runs on 127.0.0.1:7860 and is exposed to RavenX VPS via Cloudflare Tunnel.
"""
import io
import os
import re
import threading
import numpy as np
import soundfile as sf
import torch
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

load_dotenv()

# Ensure venv Scripts (ffmpeg.exe) and imageio-ffmpeg are on PATH on Windows
_venv_scripts = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts")
if os.path.isdir(_venv_scripts) and _venv_scripts not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _venv_scripts + os.pathsep + os.environ.get("PATH", "")

from f5_tts.api import F5TTS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO = os.path.join(BASE_DIR, os.environ.get("TTS_REF_AUDIO", "reference/watcher_ref.wav"))
REF_TEXT = os.environ.get("TTS_REF_TEXT", "").strip()
WORKER_SECRET = os.environ.get("TTS_WORKER_SECRET", "").strip()

app = FastAPI(title="RavenX Watcher TTS Worker")
_tts_lock = threading.Lock()
_model: F5TTS | None = None


def get_model() -> F5TTS:
    global _model
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _model = F5TTS(device=device)
    return _model


def clean_tactical_text(raw: str) -> str:
    """Strip markdown symbols and tactical prefixes so TTS reads naturally."""
    text = raw or ""
    text = re.sub(r"\[INCOMING TRANSMISSION[^\]]*\]", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = text.replace("//", ",").replace("▸", "").replace("⚠", "Warning.")
    text = re.sub(r"\s+", " ", text).strip()
    return text[:800]


class SynthesizeRequest(BaseModel):
    text: str
    speed: float = 1.05


@app.on_event("startup")
def _warmup():
    get_model()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "cuda": torch.cuda.is_available(),
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
        "ref_exists": os.path.exists(REF_AUDIO),
    }


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest, x_worker_secret: str = Header(default="")):
    if WORKER_SECRET and x_worker_secret != WORKER_SECRET:
        raise HTTPException(status_code=401, detail="Invalid worker secret")

    if not os.path.exists(REF_AUDIO):
        raise HTTPException(status_code=500, detail="Reference audio not found")

    clean_text = clean_tactical_text(req.text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Empty text")

    tts = get_model()
    with _tts_lock:
        with torch.inference_mode():
            wav, sr, _ = tts.infer(
                ref_file=REF_AUDIO,
                ref_text=REF_TEXT,
                gen_text=clean_text,
                speed=max(0.75, min(1.35, req.speed)),
                nfe_step=16,  # Fast inference on 4GB RTX 3050 while preserving vocal quality
            )

    buf = io.BytesIO()
    sf.write(buf, np.asarray(wav, dtype=np.float32), sr, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("TTS_PORT", "7860"))
    uvicorn.run(app, host="127.0.0.1", port=port)
