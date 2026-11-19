@echo off
title RavenX Watcher GPU TTS Worker (Chatterbox-Turbo)
cd /d "%~dp0"
if not exist ".env" (
    echo [ERROR] Missing tts-worker\.env file! Copy .env.example to .env first.
    pause
    exit /b 1
)
echo Starting Chatterbox-Turbo GPU Worker on http://127.0.0.1:7860 ...
start "Chatterbox-Turbo TTS Server" cmd /k ".venv\Scripts\python.exe tts_server.py"
timeout /t 5 /nobreak >nul
echo Starting Cloudflare Quick Tunnel (copy the https://*.trycloudflare.com URL to VPS backend/.env as TTS_WORKER_URL)...
if exist "cloudflared.exe" (
    "cloudflared.exe" tunnel --url http://127.0.0.1:7860
) else (
    "C:\Program Files\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:7860
)
