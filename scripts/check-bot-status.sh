#!/bin/bash

# Bot Status Checker
# This script shows the current status of your bot and monitoring system

BOT_DIR="/home/$(whoami)/repositories/telegram-student-results-bot"

echo "🤖 Bot Status Report"
echo "===================="
echo "📅 $(date)"
echo ""

# Change to bot directory
cd "$BOT_DIR" || {
    echo "❌ ERROR: Cannot access bot directory: $BOT_DIR"
    exit 1
}

# Check if bot process is running
if pgrep -f "node app.js" > /dev/null; then
    BOT_PID=$(pgrep -f "node app.js")
    echo "✅ Bot Status: RUNNING (PID: $BOT_PID)"
    
    # Show how long it's been running
    if command -v ps > /dev/null; then
        RUNTIME=$(ps -o etime= -p "$BOT_PID" 2>/dev/null | tr -d ' ')
        if [ -n "$RUNTIME" ]; then
            echo "⏱️  Runtime: $RUNTIME"
        fi
    fi
else
    echo "❌ Bot Status: NOT RUNNING"
fi

# Check if monitor is running
if pgrep -f "monitor-bot.sh" > /dev/null; then
    MONITOR_PID=$(pgrep -f "monitor-bot.sh")
    echo "👁️  Monitor Status: RUNNING (PID: $MONITOR_PID)"
else
    echo "⚠️  Monitor Status: NOT RUNNING"
fi

echo ""

# Show recent restart activity
if [ -f "restart.log" ]; then
    echo "📋 Recent Restart Activity (last 5 entries):"
    tail -5 restart.log 2>/dev/null || echo "No restart activity logged"
else
    echo "📋 No restart log found"
fi

echo ""

# Show recent app errors (if any)
if [ -f "app.log" ]; then
    echo "🔍 Recent App Log (last 3 lines):"
    tail -3 app.log 2>/dev/null || echo "No app log found"
else
    echo "🔍 No app log found"
fi

echo ""

# Show disk usage of log files
echo "💾 Log File Sizes:"
for logfile in restart.log monitor.log app.log; do
    if [ -f "$logfile" ]; then
        SIZE=$(du -h "$logfile" 2>/dev/null | cut -f1)
        echo "  $logfile: $SIZE"
    fi
done

echo ""
echo "🛠️  Quick Commands:"
echo "  ./scripts/restart-if-down.sh     - Restart bot if needed"
echo "  ./scripts/check-bot-status.sh    - Show this status report"
echo "  tail -f app.log                  - Watch live bot logs"
echo "  tail -f restart.log              - Watch restart activity"