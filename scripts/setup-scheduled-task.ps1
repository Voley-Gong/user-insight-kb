# Windows 定时任务设置脚本
# 以管理员权限运行此脚本

$taskName = "UserInsightKB-AutoContent"
$scriptPath = "D:\mimoSpace\user-insight-kb\scripts\run-auto-content.bat"

# 删除旧任务（如果存在）
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# 创建定时任务：每小时执行一次
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath`""

# 每小时触发一次，从现在开始
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 365)

# 设置任务属性
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# 注册任务
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "用户洞察知识库 - 每小时自动生成内容卡片" -Force

Write-Host "✅ 定时任务创建成功！" -ForegroundColor Green
Write-Host ""
Write-Host "任务名称: $taskName"
Write-Host "执行频率: 每小时一次"
Write-Host "脚本路径: $scriptPath"
Write-Host ""
Write-Host "管理方式:" -ForegroundColor Yellow
Write-Host "  查看任务: Get-ScheduledTask -TaskName '$taskName'"
Write-Host "  手动运行: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "  停用任务: Disable-ScheduledTask -TaskName '$taskName'"
Write-Host "  启用任务: Enable-ScheduledTask -TaskName '$taskName'"
Write-Host "  删除任务: Unregister-ScheduledTask -TaskName '$taskName'"
