#!/bin/bash
echo "🚀 Deploying bot updates..."

cd repositories/telegram-student-results-bot

echo "⬇️ Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🛑 Stopping current bot..."
pkill -f "node app.js"
sleep 3

echo "🚀 Starting updated bot..."
nohup node app.js > app.log 2>&1 &
sleep 2

echo "🔍 Checking status..."
if ps aux | grep "node app.js" | grep -v grep > /dev/null; then
    echo "✅ Bot is running!"
    curl -s https://checkresultbot.abdulaki.com/status | grep -o '"status":"[^"]*"' || echo "Web interface check failed"
else
    echo "❌ Bot failed to start!"
    echo "Last 10 lines of log:"
    tail -10 app.log
fi