#!/bin/bash

# Setup Bot Monitoring System
# This script sets up the monitoring system and makes scripts executable

BOT_DIR="/home/$(whoami)/repositories/telegram-student-results-bot"

echo "🔧 Setting up bot monitoring system..."

# Change to bot directory
cd "$BOT_DIR" || {
    echo "❌ ERROR: Cannot access bot directory: $BOT_DIR"
    exit 1
}

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x restart-bot.sh 2>/dev/null
chmod +x deploy-bot.sh 2>/dev/null

# Create log files if they don't exist
touch restart.log
touch monitor.log
touch app.log

echo "✅ Scripts are now executable"

# Test the restart script
echo "🧪 Testing restart script..."
./scripts/restart-if-down.sh

echo ""
echo "🎯 Setup complete! Here's how to use the monitoring system:"
echo ""
echo "📋 Available Commands:"
echo "  ./scripts/restart-if-down.sh     - Check and restart bot once"
echo "  ./scripts/monitor-bot.sh         - Start continuous monitoring (runs forever)"
echo "  ./scripts/check-bot-status.sh    - Show bot status and logs"
echo ""
echo "📊 Log Files:"
echo "  restart.log              - Restart activity log"
echo "  monitor.log              - Monitor activity log"
echo "  app.log                  - Bot application log"
echo ""
echo "⚙️  Cron Job Setup (Recommended):"
echo "Add this to your cPanel Cron Jobs (every 5 minutes):"
echo "*/5 * * * * cd $BOT_DIR && ./scripts/restart-if-down.sh"
echo ""
echo "🚀 To start continuous monitoring now:"
echo "nohup ./scripts/monitor-bot.sh > monitor-output.log 2>&1 &"