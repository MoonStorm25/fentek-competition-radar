@echo off
chcp 65001 > nul
title Fentek Competition Radar
echo ====================================================
echo 🚀 FENTEK YARIŞMA VE HACKATHON RADARI BAŞLATILIYOR...
echo ====================================================
echo.
echo Sunucular ve arayüz açılıyor...
echo Arayüz Adresi: http://localhost:5173
echo API Servisi:   http://localhost:5000
echo.
start http://localhost:5173
npm run dev
pause
