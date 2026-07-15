PrinterMonitor - CMD-only setup and run

This guide shows minimal steps to install and run PrinterMonitor on a Windows machine restricted to Command Prompt (CMD).

Prerequisites
- Python 3.11+ (python on PATH)
- Node.js (for frontend) if you want the UI

Quick install (run from project root in CMD)

1) Install backend Python dependencies and create venv

    scripts\install.bat

This will:
- create `backend\venv`
- install Python packages from `backend\requirements.txt`
- install frontend packages (`npm ci`) in `frontend` if Node.js is available

Run the app (recommended)

2) Start both backend and frontend (backgrounded)

    start.bat

This script will:
- ensure venv and node_modules exist (and create them if missing)
- start backend with `uvicorn` on `http://localhost:8088`
- start frontend dev server on `http://localhost:5173`
- open the browser to the frontend URL

Run only backend (if you don't need frontend)

1) From CMD in project root:

    scripts\run_backend.bat

This will run the backend with the venv Python using `uvicorn`.

If you prefer to run manually:

    cd backend
    python -m venv venv
    venv\Scripts\python.exe -m pip install -r requirements.txt
    venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8088

Notes & Troubleshooting
- If Python or Node.js are not found, install them and ensure they are on PATH.
- All provided `.bat` scripts are CMD-compatible and avoid PowerShell-specific commands.
- Logs are written to `logs\` when using `start.bat`.

If you want, I can create a single `install_and_start.bat` that performs install and immediately starts the app; tell me if you want that.
