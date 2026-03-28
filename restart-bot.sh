#!/bin/bash
cd repositories/telegram-student-results-bot
echo "🛑 Stopping bot..."
pkill -f "node app.js"
sleep 3
echo "🚀 Starting bot..."
nohup node app.js > app.log 2>&1 &
sleep 2
echo "✅ Bot restarted!"
ps aux | grep "node app.js" | grep -v grep