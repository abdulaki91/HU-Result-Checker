#!/bin/bash

# Continuous Bot Monitor
# This script runs continuously and monitors the bot every minute

BOT_DIR="/home/$(whoami)/repositories/telegram-student-results-bot"
MONITOR_LOG="$BOT_DIR/monitor.log"

# Function to log messages with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$MONITOR_LOG"
}

log_message "Bot monitor started"

# Change to bot directory
cd "$BOT_DIR" || {
    log_message "ERROR: Cannot access bot directory: $BOT_DIR"
    exit 1
}

# Continuous monitoring loop
while true; do
    # Run the restart check
    ./scripts/restart-if-down.sh
    
    # Wait 60 seconds before next check
    sleep 60
done