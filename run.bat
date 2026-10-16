@echo off
title Cipher Studio Suite — Launcher
color 0F
cls
echo =================================================================
echo        CIPHER STUDIO SUITE // WARM BENTO BRUTALISM
echo =================================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Python was not found in your system PATH.
    echo [*] Opening Cipher Studio locally in your default browser...
    start "" "index.html"
    pause
    exit /b
)

echo [*] Checking Python dependencies...
python -c "import flask" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] Installing Flask...
    pip install -r requirements.txt
)

echo [*] Starting Cipher Studio Server...
echo [*] Opening http://localhost:5000 in your browser...
python app.py
pause
