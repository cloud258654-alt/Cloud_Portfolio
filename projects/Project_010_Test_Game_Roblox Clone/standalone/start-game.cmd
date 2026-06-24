@echo off
cd /d "%~dp0"
set PORT=4180
start "" "http://localhost:%PORT%"
node server.mjs
