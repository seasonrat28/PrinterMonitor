@echo off
cd /d "%~dp0\..\backend"

echo ==================================================
echo PrinterMonitor - Install and Start (CMD-only)
echo ==================================================

:: Create venv if missing
if not exist "venv\Scripts\python.exe" (
    echo [SETUP] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtualenv. Ensure Python 3.11+ is installed and on PATH.
        pause
        exit /b 1
    )
)

echo [SETUP] Installing Python packages...
"venv\Scripts\python.exe" -m pip install --upgrade pip
"venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] pip install failed.
    pause
    exit /b 1
)

echo [SETUP] Backend dependencies installed.

:: Optionally install frontend if Node is present
cd ..\frontend
where npm >nul 2>&1
if errorlevel 0 (
    echo [SETUP] Installing frontend npm packages...
    call npm ci
    if errorlevel 1 (
        echo [WARNING] npm install failed — frontend may not run.
    )
) else (
    echo [INFO] Node.js not found — skipping frontend install.
)

cd ..

:: Create logs folder
if not exist "logs" mkdir "logs"

echo [START] Launching backend with uvicorn (background)...
start "Backend" cmd /c "cd backend && "venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8088 > ..\logs\backend.log 2> ..\logs\backend_err.log"

where npm >nul 2>&1
if errorlevel 0 (
    echo [START] Launching frontend (background)...
    start "Frontend" cmd /c "cd frontend && npm run dev -- --host 0.0.0.0 > ..\logs\frontend.log 2> ..\logs\frontend_err.log"
) else (
    echo [INFO] Frontend not started (Node.js not found).
)

echo.
echo Backend: http://localhost:8088
echo Frontend: http://localhost:5173
echo Logs: %~dp0..\logs

pause
