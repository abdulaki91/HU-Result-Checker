# Bot Monitoring Setup Guide

## 🚀 Quick Setup

1. **Make scripts executable:**

   ```bash
   chmod +x scripts/*.sh
   ```

2. **Test the system:**
   ```bash
   ./scripts/setup-monitoring.sh
   ```

## 📋 Method 1: Cron Job (Recommended)

### Step 1: Get your bot path

```bash
pwd
# Copy the output (e.g., /home/username/repositories/telegram-student-results-bot)
```

### Step 2: Add Cron Job in cPanel

1. Go to **cPanel → Cron Jobs**
2. Add a new cron job:
   - **Minute:** `*/5` (every 5 minutes)
   - **Hour:** `*`
   - **Day:** `*`
   - **Month:** `*`
   - **Weekday:** `*`
   - **Command:** `cd /home/username/repositories/telegram-student-results-bot && ./scripts/restart-if-down.sh`

### Step 3: Alternative Cron Frequencies

- Every 2 minutes: `*/2 * * * *`
- Every 10 minutes: `*/10 * * * *`
- Every hour: `0 * * * *`

## 📋 Method 2: Continuous Monitor

### Start continuous monitoring:

```bash
nohup ./scripts/monitor-bot.sh > monitor-output.log 2>&1 &
```

### Stop continuous monitoring:

```bash
pkill -f "monitor-bot.sh"
```

## 🛠️ Available Scripts

| Script                        | Purpose                              |
| ----------------------------- | ------------------------------------ |
| `scripts/restart-if-down.sh`  | Check and restart bot once           |
| `scripts/monitor-bot.sh`      | Continuous monitoring (runs forever) |
| `scripts/check-bot-status.sh` | Show bot status and logs             |
| `scripts/setup-monitoring.sh` | Initial setup                        |

## 📊 Monitoring Commands

### Check bot status:

```bash
./scripts/check-bot-status.sh
```

### Watch live logs:

```bash
tail -f app.log          # Bot application logs
tail -f restart.log      # Restart activity
tail -f monitor.log      # Monitor activity
```

### Manual restart:

```bash
./scripts/restart-if-down.sh
```

## 🔧 Troubleshooting

### If scripts don't work:

1. Check permissions: `ls -la scripts/*.sh`
2. Make executable: `chmod +x scripts/*.sh`
3. Check paths in scripts match your setup

### If bot keeps crashing:

1. Check `app.log` for errors
2. Check memory usage: `free -h`
3. Check disk space: `df -h`

### If webhook fails:

1. Verify `setup-webhook.js` works manually
2. Check bot token in `.env`
3. Check internet connectivity

## 📈 Log Management

Logs are automatically rotated to prevent disk space issues:

- `restart.log` keeps last 100 lines
- Monitor other logs manually if they grow too large

### Clean logs manually:

```bash
> app.log           # Clear app log
> restart.log       # Clear restart log
> monitor.log       # Clear monitor log
```

## ⚡ Quick Start

1. Run setup: `./scripts/setup-monitoring.sh`
2. Add cron job (see Method 1 above)
3. Check status: `./scripts/check-bot-status.sh`

Your bot will now automatically restart if it stops!
scr   