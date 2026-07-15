@echo off
cd ..\backend
if not exist "backend\venv\Scripts\python.exe" (
	echo Virtualenv not found. Run scripts\install.bat first or use start.bat from project root.
	pause
	exit /b 1
)

cd ..\backend
:: Run backend with uvicorn using venv Python
"venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8088
pause
