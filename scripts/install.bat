@echo off
echo Installing Backend Dependencies...
cd ..\backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
deactivate

echo.
echo Installing Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo Install completed!
pause
