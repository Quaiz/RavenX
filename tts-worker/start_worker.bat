@echo off
title RavenX Watcher GPU TTS Worker
cd /d "%~dp0"
if not exist ".env" (
    echo [ERROR] Missing tts-worker\.env file! Copy .env.example to .env first.
    pause
    exit /b 1
)
echo Starting F5-TTS GPU Worker on http://127.0.0.1:7860 ...
start "F5-TTS Server" cmd /k ".venv\Scripts\python.exe tts_server.py"
timeout /t 5 /nobreak >nul
echo Starting Cloudflare Quick Tunnel (copy the https://*.trycloudflare.com URL to VPS backend/.env as TTS_WORKER_URL)...
"C:\Program Files\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:7860
