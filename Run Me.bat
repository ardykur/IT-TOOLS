@echo off
title ICT PDSI IT Tool Launcher
color 0A

:: Check Admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Meminta akses Administrator...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

echo ============================================
echo        ICT PDSI IT INTERNAL TOOL
echo ============================================
echo.

if not exist "IT-Tool-WPF.ps1" (
    echo ERROR: File IT-Tool-WPF.ps1 tidak ditemukan.
    echo Pastikan file BAT ini satu folder dengan IT-Tool-WPF.ps1
    echo.
    pause
    exit /b
)

if not exist "Installers" (
    echo WARNING: Folder Installers tidak ditemukan.
    echo Beberapa menu install aplikasi mungkin tidak berjalan.
    echo.
    pause
)

if not exist "Logs" (
    mkdir "Logs"
)

echo Menjalankan ICT PDSI IT Tool...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0IT-Tool-WPF.ps1"

if errorlevel 1 (
    echo.
    echo Terjadi error saat menjalankan tool.
    echo.
    pause
)

exit /b