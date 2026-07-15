@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title PrinterMonitor

echo.
echo  ==========================================
echo    PrinterMonitor - Starting Up
echo  ==========================================
echo.

:: ============ Check / Setup Python venv ============
if not exist "backend\venv\Scripts\python.exe" goto setup_python
"backend\venv\Scripts\python.exe" -c "import fastapi, uvicorn, pysnmp" >nul 2>&1
if errorlevel 1 goto setup_python
goto check_frontend

:setup_python
echo [SETUP] Installing Python packages (first run only)...
if exist "backend\venv" rmdir /s /q "backend\venv"
where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python 3 not found. Install Python 3.11+ and re-run this file.
  pause & exit /b 1
)
python -m venv "backend\venv"
if errorlevel 1 goto setup_failed
"backend\venv\Scripts\python.exe" -m pip install --upgrade pip --quiet
"backend\venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt" --quiet
if errorlevel 1 goto setup_failed
echo [SETUP] Python packages installed successfully.

:check_frontend
if not exist "frontend\node_modules" goto setup_frontend
goto start

:setup_frontend
echo [SETUP] Installing Node.js packages (first run only)...
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node.js LTS and re-run this file.
  pause & exit /b 1
)
pushd "frontend"
call npm.cmd ci --silent
if errorlevel 1 ( popd & goto setup_failed )
popd
echo [SETUP] Node.js packages installed successfully.

:start
echo.
echo  Starting Backend and Frontend...
echo.

:: Create log directory
if not exist "logs" mkdir "logs"

start /B "Backend" cmd /c "cd backend && "venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8088 > "..\logs\backend.log" 2> "..\logs\backend_err.log""
start /B "Frontend" cmd /c "cd frontend && npm run dev -- --host 0.0.0.0 > "..\logs\frontend.log" 2> "..\logs\frontend_err.log""

echo.
echo ===============================================================================
echo   [Frontend] http://localhost:5173
echo   [Backend]  http://localhost:8088
echo   [Docs]     http://localhost:8088/docs
echo   [Frontend] http://localhost:5173
echo.
echo   PrinterMonitor is running in the background of THIS window!
echo   (Do NOT close this window if you want to keep the server running)
echo   Logs are in: logs\
echo.
timeout /t 5
start http://localhost:5173

goto end

:setup_failed
echo.
echo [ERROR] Setup failed. Check messages above and re-run this file.
pause
exit /b 1

:end
echo.
echo PrinterMonitor stopped.
pause
