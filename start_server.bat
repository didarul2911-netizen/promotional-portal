@echo off
title Radiant Promotional Material Management System
cd /d "%~dp0"
echo ============================================================
echo   Radiant Pharmaceuticals Limited - GEN-A Team (SMD / PMMD)
echo   Promotional Material Synchronization Portal
echo ============================================================
echo.
echo Starting Flask Server...
start "" http://127.0.0.1:5000
python app.py
pause
