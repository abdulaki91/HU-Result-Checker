# Windows PowerShell Bot Restart Script
# For local development/testing only

Write-Host "Bot Restart Script for Windows" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if bot is running
$botProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*app.js*" }

if ($botProcess) {
    Write-Host "Bot is running (PID: $($botProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Bot is not running - Starting bot..." -ForegroundColor Red
    
    # Kill any existing node processes (cleanup)
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Start the bot
    Write-Host "Starting bot process..." -ForegroundColor Yellow
    Start-Process -FilePath "node" -ArgumentList "app.js" -WindowStyle Hidden
    
    Start-Sleep -Seconds 5
    
    # Setup webhook
    Write-Host "Setting up webhook..." -ForegroundColor Yellow
    node setup-webhook.js
    
    # Check if started successfully
    $newBotProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*app.js*" }
    if ($newBotProcess) {
        Write-Host "Bot started successfully (PID: $($newBotProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "Failed to start bot" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Note: This is for local Windows testing only." -ForegroundColor Yellow
Write-Host "Use the bash scripts on your Linux server for production." -ForegroundColor Yellow