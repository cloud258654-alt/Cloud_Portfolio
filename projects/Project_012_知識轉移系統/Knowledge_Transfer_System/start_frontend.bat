@echo off
title KTS Knowledge Transfer System
echo ======================================
echo  AI Knowledge Transfer System
echo ======================================
echo.
echo Starting server at http://localhost:3000
echo Close this window to stop the server.
echo.
cd /d "%~dp0frontend"
call npm run start
pause
