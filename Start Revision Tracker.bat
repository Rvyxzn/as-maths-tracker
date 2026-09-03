@echo off
title A-Level Maths Revision Tracker
cd /d "%~dp0"

python ".claude\serve.py" --open
if errorlevel 9009 goto nopython
goto end

:nopython
echo.
echo Could not find Python, which this needs in order to serve the site.
echo Install it from https://www.python.org/downloads/ and tick
echo "Add python.exe to PATH" during setup, then run this file again.
echo.
pause

:end
