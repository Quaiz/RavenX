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

from chatterbox.tts_turbo import ChatterboxTurboTTS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REF_AUDIO = os.path.join(BASE_DIR, os.environ.get("TTS_REF_AUDIO", "reference/watcher_ref.wav"))
WORKER_SECRET = os.environ.get("TTS_WORKER_SECRET", "").strip()

app = FastAPI(title="RavenX Watcher TTS Worker (Chatterbox-Turbo)")
_tts_lock = threading.Lock()
_model: ChatterboxTurboTTS | None = None
_conds_prepared = False


def get_model() -> ChatterboxTurboTTS:
    global _model, _conds_prepared
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _model = ChatterboxTurboTTS.from_pretrained(device=device)
        if os.path.exists(REF_AUDIO):
            _model.prepare_conditionals(REF_AUDIO, norm_loudness=False)
            _conds_prepared = True
    return _model


def _split_sentences(text: str, max_chars: int = 220) -> list[str]:
    """Split long briefings into short chunks to keep 4GB VRAM usage safe."""
    parts = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    cur = ""
    for part in parts:
        if not part:
            continue
        if len(cur) + len(part) + 1 <= max_chars:
            cur = f"{cur} {part}".strip()
        else:
            if cur:
                chunks.append(cur)
            cur = part[:max_chars]
    if cur:
        chunks.append(cur)
    return chunks or [text[:max_chars]]


def clean_tactical_text(raw: str) -> str:
    """Strip markdown symbols and normalize tactical acronyms/numbers for fast, clean TTS."""
    text = raw or ""
    text = re.sub(r"\[INCOMING TRANSMISSION[^\]]*\]", "", text, flags=re.IGNORECASE)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\bSITREP\b:?", "Situation report,", text, flags=re.IGNORECASE)
    text = re.sub(r"\bM(\d+(?:\.\d+)?)\+?", r"magnitude \1", text)
    text = re.sub(r"(\d+)\.(\d+)", r"\1 point \2", text)
    text = text.replace("+", " plus ").replace("%", " percent").replace("&", " and ")
    text = text.replace("//", ",").replace("/", " ").replace(":", ", ")
    text = text.replace("▸", "").replace("⚠", "Warning.").replace("|", ", ")
    text = re.sub(r"([A-Za-z])-([A-Za-z])", r"\1 \2", text)
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
    chunks = _split_sentences(clean_text, max_chars=130)
    audio_segments: list[np.ndarray] = []
    pause = np.zeros(int(tts.sr * 0.12), dtype=np.float32)

    with _tts_lock:
        if not _conds_prepared:
            tts.prepare_conditionals(REF_AUDIO, norm_loudness=False)
        with torch.inference_mode():
            for idx, chunk in enumerate(chunks):
                wav = tts.generate(
                    chunk,
                    temperature=0.65,
                    repetition_penalty=1.3,
                    norm_loudness=False,
                )
                seg = wav.squeeze().cpu().numpy().astype(np.float32)
                audio_segments.append(seg)
                if idx < len(chunks) - 1:
                    audio_segments.append(pause)

    full_wav = np.concatenate(audio_segments) if len(audio_segments) > 1 else audio_segments[0]
    peak = float(np.max(np.abs(full_wav)))
    if peak > 1e-6:
        full_wav = full_wav / peak * 0.92

    buf = io.BytesIO()
    sf.write(buf, full_wav, tts.sr, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("TTS_PORT", "7860"))
    uvicorn.run(app, host="127.0.0.1", port=port)
