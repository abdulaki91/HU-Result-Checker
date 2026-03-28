# 🖥️ Managing Node.js via SSH Terminal

## The Problem

When you start Node.js with `node app.js` in SSH, it stops when you disconnect. You need background process management.

## ✅ Solution: Proper Background Process Management

### Method 1: Using `nohup` (Recommended for your setup)

#### Start the bot:

```bash
cd repositories/telegram-student-results-bot
nohup node app.js > app.log 2>&1 &
```

#### Restart the bot:

```bash
cd repositories/telegram-student-results-bot
pkill -f "node app.js"
sleep 2
nohup node app.js > app.log 2>&1 &
```

#### Check if running:

```bash
ps aux | grep "node app.js"
```

#### View logs:

```bash
tail -f app.log
```

### Method 2: Using `screen` (Alternative)

#### Start a screen session:

```bash
screen -S telegram-bot
cd repositories/telegram-student-results-bot
node app.js
```

#### Detach from screen (keeps running):

Press `Ctrl+A`, then `D`

#### Reattach to screen:

```bash
screen -r telegram-bot
```

#### Kill screen session:

```bash
screen -S telegram-bot -X quit
```

### Method 3: Using `tmux` (Alternative)

#### Start tmux session:

```bash
tmux new-session -d -s telegram-bot 'cd repositories/telegram-student-results-bot && node app.js'
```

#### Attach to session:

```bash
tmux attach-session -t telegram-bot
```

#### Detach from session:

Press `Ctrl+B`, then `D`

#### Kill session:

```bash
tmux kill-session -t telegram-bot
```

## 🚀 Easy Restart Commands

### Create a restart script:

```bash
# Create restart script
cat > restart-bot.sh << 'EOF'
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
EOF

# Make it executable
chmod +x restart-bot.sh
```

### Use the restart script:

```bash
./restart-bot.sh
```

## 📋 Complete Deployment + Restart Workflow

### Create a deployment script:

```bash
cat > deploy-bot.sh << 'EOF'
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
EOF

chmod +x deploy-bot.sh
```

### Use the deployment script:

```bash
./deploy-bot.sh
```

## 🔧 Quick Commands for SSH Management

### Check bot status:

```bash
# Check if process is running
ps aux | grep "node app.js"

# Check web interface
curl https://checkresultbot.abdulaki.com/status

# Check recent logs
tail -20 app.log
```

### Restart bot:

```bash
# Quick restart (one-liner)
cd repositories/telegram-student-results-bot && pkill -f "node app.js" && sleep 2 && nohup node app.js > app.log 2>&1 &
```

### Deploy updates:

```bash
# Quick deploy (one-liner)
cd repositories/telegram-student-results-bot && git pull && pkill -f "node app.js" && sleep 2 && nohup node app.js > app.log 2>&1 &
```

## 🎯 Your Typical SSH Workflow

### 1. SSH to server:

```bash
ssh -p 1219 abdulaki@abdulaki.com
```

### 2. Deploy updates:

```bash
./deploy-bot.sh
```

### 3. Or just restart:

```bash
./restart-bot.sh
```

### 4. Check status:

```bash
ps aux | grep "node app.js"
curl https://checkresultbot.abdulaki.com/status
```

### 5. View logs if needed:

```bash
tail -f app.log
```

## 🚨 Troubleshooting

### If bot stops after SSH disconnect:

```bash
# Make sure you used nohup
nohup node app.js > app.log 2>&1 &

# Check if process is still running
ps aux | grep "node app.js"
```

### If you can't kill the process:

```bash
# Force kill
pkill -9 -f "node app.js"

# Or find PID and kill
ps aux | grep "node app.js"
kill -9 <PID>
```

### If port is in use:

```bash
# Check what's using port 3000
netstat -tulpn | grep :3000
lsof -i :3000

# Kill process using the port
fuser -k 3000/tcp
```

## 💡 Pro Tips

1. **Always use `nohup`** when starting from SSH
2. **Create scripts** for common tasks (restart, deploy)
3. **Check logs** with `tail -f app.log` for real-time monitoring
4. **Test the web interface** after every restart
5. **Use `screen` or `tmux`** if you need interactive sessions

## 🎉 Summary

Your bot management commands:

- **Start**: `nohup node app.js > app.log 2>&1 &`
- **Restart**: `./restart-bot.sh`
- **Deploy**: `./deploy-bot.sh`
- **Status**: `ps aux | grep "node app.js"`
- **Logs**: `tail -f app.log`

Now you can easily manage your Node.js bot via SSH terminal! 🚀
