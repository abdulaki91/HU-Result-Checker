#!/bin/bash

# Bot Auto-Restart Script
# This script checks if the bot is running and restarts it if needed

BOT_DIR="/home/$(whoami)/repositories/telegram-student-results-bot"
LOG_FILE="$BOT_DIR/restart.log"
APP_LOG="$BOT_DIR/app.log"

# Function to log messages with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_FILE"
}

# Change to bot directory
cd "$BOT_DIR" || {
    log_message "ERROR: Cannot access bot directory: $BOT_DIR"
    exit 1
}

# Check if bot process is running
if pgrep -f "node app.js" > /dev/null; then
    # Bot is running, check if it's responsive (optional)
    log_message "Bot is running (PID: $(pgrep -f 'node app.js'))"
else
    # Bot is not running, restart it
    log_message "Bot is DOWN - Starting restart process..."
    
    # Kill any remaining processes (cleanup)
    pkill -f "node app.js" 2>/dev/null
    sleep 3
    
    # Start the bot
    log_message "Starting bot process..."
    nohup node app.js > "$APP_LOG" 2>&1 &
    
    # Wait for bot to initialize
    sleep 10
    
    # Setup webhook
    log_message "Setting up webhook..."
    node setup-webhook.js >> "$LOG_FILE" 2>&1
    
    # Verify bot started
    if pgrep -f "node app.js" > /dev/null; then
        log_message "SUCCESS: Bot restarted successfully (PID: $(pgrep -f 'node app.js'))"
    else
        log_message "ERROR: Bot failed to start"
        # Show last few lines of app log for debugging
        echo "Last 5 lines of app.log:" >> "$LOG_FILE"
        tail -5 "$APP_LOG" >> "$LOG_FILE" 2>/dev/null
    fi
fi

# Keep only last 100 lines of restart log to prevent it from growing too large
tail -100 "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null && mv "$LOG_FILE.tmp" "$LOG_FILE"