@echo off
title RavenX Launcher
echo.
echo     ____                           _  __
echo    / __ \____ __   _____  ____    ^| ^|/ /
echo   / /_/ / __ `/ ^| / / _ \/ __ \   ^|   / 
echo  / _, _/ /_/ /^| ^|/ /  __/ / / /  /   ^|  
echo /_/ ^|_^|\__,_/ ^|___/\___/_/ /_/  /_/^|_^| 
echo.
echo  [*] Launching Backend  ^(Flask :5000^)
echo  [*] Launching Frontend ^(Vite  :5173^)
echo.

:: Start backend in a new window
start "RavenX // BACKEND :5000" cmd /k "cd /d %~dp0backend && echo [BACKEND] Starting Flask... && python server.py"

:: Small delay so backend gets a head start
timeout /t 2 /nobreak >nul

:: Start frontend in a new window
start "RavenX // FRONTEND :5173" cmd /k "cd /d %~dp0tactical-ui && echo [FRONTEND] Starting Vite... && npm run dev"

echo  [OK] Both services launched. Close this window.
timeout /t 3 /nobreak >nul
