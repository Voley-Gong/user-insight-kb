@echo off
chcp 65001 >nul
echo ========================================
echo   用户洞察知识库 - 自动内容生成
echo   %date% %time%
echo ========================================

cd /d D:\mimoSpace\user-insight-kb
node scripts\auto-content.cjs

echo.
echo ========================================
echo   任务完成: %date% %time%
echo ========================================
pause
