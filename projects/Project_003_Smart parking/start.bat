@echo off
set "BASE=%~dp0"

echo Starting Smart Parking System...

echo [1/2] Starting Backend API on port 3001...
start "Backend-API" cmd /k "cd /d "%BASE%backend" && node src\index.js"

echo [2/2] Starting Frontend on port 5173...
start "Frontend-Vite" cmd /k "cd /d "%BASE%frontend" && node node_modules\vite\bin\vite.js"

echo.
echo Wait a few seconds, then open http://localhost:5173
