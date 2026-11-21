@echo off
cd /d "%~dp0"
title Arcade Party
if exist "%~dp0node.exe" (
  "%~dp0node.exe" server.js
) else (
  node server.js
)
if errorlevel 1 (
  echo.
  echo Start fehlgeschlagen. Liegt node.exe in diesem Ordner?
  pause
)
