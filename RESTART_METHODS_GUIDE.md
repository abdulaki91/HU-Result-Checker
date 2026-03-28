# 🔄 Node.js Restart Methods Guide

## The Issue: `npm restart` Command Not Found

The `npm restart` command only works if you have a "restart" script defined in your `package.json`. I've now added the necessary scripts to your `package.json`.

## ✅ Available Restart Methods (Updated)

### Method 1: NPM Scripts (Now Available)

```bash
# Start the bot
npm start

# Stop the bot
npm run stop

# Restart the bot
npm restart

# Check if bot is running
npm run status
```

### Method 2: PM2 (Recommended for Production)

```bash
# PM2 commands via npm scripts
npm run pm2:start     # Start with PM2
npm run pm2:restart   # Restart with PM2
npm run pm2:stop      # Stop PM2 process
npm run pm2:status    # Check PM2 status
npm run pm2:logs      # View PM2 logs

# Direct PM2 commands
pm2 start app.js --name telegram-bot
pm2 restart telegram-bot
pm2 stop telegram-bot
pm2 status
pm2 logs telegram-bot
```

### Method 3: Manual Process Management

```bash
# Kill existing process
pkill -f "node app.js"

# Start new process in background
nohup node app.js > app.log 2>&1 &

# Check if running
ps aux | grep "node app.js"
```

### Method 4: Direct Node.js

```bash
# Start in foreground (will block terminal)
node app.js

# Start in background
nohup node app.js &

# Start with output redirection
nohup node app.js > app.log 2>&1 &
```

## 🚀 Updated Deployment Workflow

### Quick Deployment (One-liner)

```bash
cd repositories/telegram-student-results-bot && git pull origin main && npm restart
```

### With PM2 (Recommended)

```bash
cd repositories/telegram-student-results-bot && git pull origin main && npm run pm2:restart
```

### Step-by-Step Deployment

```bash
# 1. Navigate to bot directory
cd repositories/telegram-student-results-bot

# 2. Pull latest changes
git pull origin main

# 3. Install/update dependencies
npm install

# 4. Restart the bot (choose one)
npm restart                    # Using npm scripts
npm run pm2:restart           # Using PM2 via npm
pm2 restart telegram-bot      # Direct PM2 command
```

## 🔧 Troubleshooting Restart Issues

### If `npm restart` Still Doesn't Work

```bash
# Check if package.json was updated
grep -A 5 '"restart"' package.json

# Manual restart
npm run stop
sleep 2
npm start
```

### If PM2 Commands Don't Work

```bash
# Check if PM2 is installed
which pm2
pm2 --version

# Install PM2 if missing
npm install -g pm2

# Start bot with PM2 for first time
pm2 start app.js --name telegram-bot
pm2 save
```

### If Process Won't Stop

```bash
# Force kill all node processes (be careful!)
pkill -9 -f "node"

# Force kill specific app
pkill -9 -f "node app.js"

# Check what's using port 3000
lsof -i :3000
netstat -tulpn | grep :3000
```

## 📋 Complete Restart Command Reference

### NPM Scripts (Now Available)

```bash
npm start              # Start bot
npm run stop           # Stop bot
npm restart            # Stop and start bot
npm run status         # Check if running
npm run pm2:start      # Start with PM2
npm run pm2:restart    # Restart with PM2
npm run pm2:stop       # Stop PM2 process
npm run pm2:status     # PM2 status
npm run pm2:logs       # PM2 logs
```

### Direct Commands

```bash
# PM2 commands
pm2 start app.js --name telegram-bot
pm2 restart telegram-bot
pm2 stop telegram-bot
pm2 delete telegram-bot
pm2 status
pm2 logs telegram-bot

# Manual process management
pkill -f "node app.js"
nohup node app.js > app.log 2>&1 &
ps aux | grep "node app.js"

# System service (if configured)
systemctl start telegram-bot
systemctl restart telegram-bot
systemctl stop telegram-bot
systemctl status telegram-bot
```

## 🎯 Recommended Workflow for Your Server

### Option A: Using NPM Scripts (Simple)

```bash
# Deploy and restart
cd repositories/telegram-student-results-bot
git pull origin main
npm install
npm restart

# Check status
npm run status
curl https://checkresultbot.abdulaki.com/status
```

### Option B: Using PM2 (Production Ready)

```bash
# First time setup
cd repositories/telegram-student-results-bot
npm install -g pm2
pm2 start app.js --name telegram-bot
pm2 save
pm2 startup  # Follow instructions for auto-start

# Regular deployment
cd repositories/telegram-student-results-bot
git pull origin main
npm install
pm2 restart telegram-bot

# Check status
pm2 status
pm2 logs telegram-bot --lines 10
```

## 🔍 Verification Commands

After any restart method:

```bash
# Check if process is running
npm run status
# OR
ps aux | grep "node app.js"

# Check web interface
curl https://checkresultbot.abdulaki.com/status
curl https://checkresultbot.abdulaki.com/health

# Check webhook
curl -s "https://api.telegram.org/bot8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA/getWebhookInfo" | grep '"url"'
```

## 🚨 Emergency Restart

If everything is stuck:

```bash
cd repositories/telegram-student-results-bot
pkill -9 -f "node app.js"
sleep 3
git pull origin main
npm install
npm start
```

## 💡 Pro Tips

1. **Use PM2 for production** - it handles crashes, logging, and monitoring
2. **Always check status after restart** - make sure the bot actually started
3. **Keep logs** - use `npm run pm2:logs` or `tail -f app.log` to monitor
4. **Test the bot** - send a test message on Telegram after deployment

Your restart commands are now fixed! Use `npm restart` for simple deployments or `npm run pm2:restart` for production-grade process management.
