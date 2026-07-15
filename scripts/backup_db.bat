@echo off
cd ..\backend\database
copy printer.db printer_backup_%date:/=-%_%time::=-%.db
echo Database backed up!
pause
