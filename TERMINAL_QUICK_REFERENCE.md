# 🖥️ Terminal Quick Reference

## Your Git Pull + Node.js Restart Workflow

Since you use terminal to pull code to your server, here are the essential commands you need.

## ⚡ Quick Commands (Copy & Paste Ready)

### Standard Deployment

```bash
cd repositories/telegram-student-results-bot && git pull origin main && npm install && pm2 restart telegram-bot
```

### Manual Restart (if no PM2)

```bash
cd repositories/telegram-student-results-bot && git pull origin main && npm install && pkill -f "node app.js" && nohup node app.js > app.log 2>&1 &
```

### With Status Check

```bash
cd repositories/telegram-student-results-bot && git pull origin main && pm2 restart telegram-bot && curl -s https://checkresultbot.abdulaki.com/status
```

## 🔄 Node.js Restart Methods

### Method 1: PM2 (Recommended)

```bash
# Restart specific app
pm2 restart telegram-bot

# Check status
pm2 status

# View logs
pm2 logs telegram-bot
```

### Method 2: Manual Process Management

```bash
# Kill existing process
pkill -f "node app.js"

# Start new process
nohup node app.js > app.log 2>&1 &

# Check if running
ps aux | grep "node app.js"
```

### Method 3: Using Screen

```bash
# Start in screen session
screen -S telegram-bot
node app.js
# Press Ctrl+A, then D to detach

# Reattach later
screen -r telegram-bot
```

## 📋 Step-by-Step Deployment

### 1. Navigate to Bot Directory

```bash
cd repositories/telegram-student-results-bot
```

### 2. Pull Latest Changes

```bash
git pull origin main
```

### 3. Update Dependencies (if needed)

```bash
npm install
```

### 4. Restart Node.js Application

Choose one:

```bash
# Option A: PM2
pm2 restart telegram-bot

# Option B: Manual
pkill -f "node app.js" && nohup node app.js > app.log 2>&1 &

# Option C: Direct (if no background process needed)
node app.js
```

### 5. Verify Deployment

```bash
# Check application status
curl https://checkresultbot.abdulaki.com/status

# Check if process is running
ps aux | grep "node app.js"
```

## 🛠️ Troubleshooting Commands

### Check What's Running

```bash
# Check Node.js processes
ps aux | grep node

# Check specific port
netstat -tulpn | grep :3000
lsof -i :3000
```

### View Logs

```bash
# PM2 logs
pm2 logs telegram-bot

# Manual logs
tail -f app.log
tail -f logs/app.log
tail -f logs/errors.log
```

### Force Restart

```bash
# Kill all Node.js processes (be careful!)
pkill -9 -f "node"

# Kill specific app
pkill -9 -f "node app.js"

# Start fresh
cd repositories/telegram-student-results-bot && node app.js
```

## 🔧 PM2 Setup (One-time)

If you don't have PM2 set up:

```bash
# Install PM2
npm install -g pm2

# Start your app with PM2
cd repositories/telegram-student-results-bot
pm2 start app.js --name telegram-bot

# Save PM2 configuration
pm2 save

# Auto-start on server reboot
pm2 startup
# Follow the instructions it gives you
```

## 📱 Testing After Deployment

### Quick Tests

```bash
# Test status endpoint
curl https://checkresultbot.abdulaki.com/status

# Test health endpoint
curl https://checkresultbot.abdulaki.com/health

# Check webhook status
curl -s "https://api.telegram.org/bot8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA/getWebhookInfo" | grep -o '"url":"[^"]*"'
```

### Telegram Bot Tests

After deployment, test on Telegram:

- Send: `0014/14` (should work if student exists)
- Send: `ST001` (should show format error)
- Send: `0014` (should show format error)

## 🎯 Your Typical Workflow

```bash
# 1. SSH to your server
ssh user@your-server.com

# 2. Navigate to bot directory
cd repositories/telegram-student-results-bot

# 3. Pull latest changes
git pull origin main

# 4. Restart bot
pm2 restart telegram-bot

# 5. Quick verification
curl -s https://checkresultbot.abdulaki.com/status | grep "Active"

# 6. Done! 🎉
```

## 🚨 Emergency Commands

### If Bot is Completely Stuck

```bash
# Nuclear option - kill everything and restart
cd repositories/telegram-student-results-bot
pkill -9 -f "node app.js"
sleep 3
git pull origin main
npm install
nohup node app.js > app.log 2>&1 &
```

### Check What Went Wrong

```bash
# Check recent errors
tail -20 logs/errors.log

# Check system resources
free -h
df -h

# Check if port is blocked
netstat -tulpn | grep :3000
```

## 📝 Useful Aliases

Add these to your `~/.bashrc` for even faster deployment:

```bash
# Add to ~/.bashrc
alias bot-deploy='cd repositories/telegram-student-results-bot && git pull origin main && pm2 restart telegram-bot'
alias bot-status='pm2 status telegram-bot && curl -s https://checkresultbot.abdulaki.com/status'
alias bot-logs='pm2 logs telegram-bot'
alias bot-restart='pm2 restart telegram-bot'

# Reload bashrc
source ~/.bashrc
```

Then you can just run:

```bash
bot-deploy    # Deploy latest changes
bot-status    # Check status
bot-logs      # View logs
bot-restart   # Just restart
```

## 🎉 Summary

Your terminal deployment is now streamlined! The key commands you'll use most:

1. **Deploy**: `cd repositories/telegram-student-results-bot && git pull && pm2 restart telegram-bot`
2. **Check**: `curl https://checkresultbot.abdulaki.com/status`
3. **Logs**: `pm2 logs telegram-bot`
4. **Restart**: `pm2 restart telegram-bot`

Keep this reference handy for quick deployments! 🚀
