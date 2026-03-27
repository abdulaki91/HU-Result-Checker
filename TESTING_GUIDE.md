# 🔧 Bot Testing & Troubleshooting Guide

## Current Status

✅ **Bot Token**: Working (@check_results_bot)  
✅ **Database**: MySQL connection successful  
❌ **Application**: Not running on server (404 errors)  
❌ **Webhook**: Not configured (7 pending updates)

## Step-by-Step Testing Process

### 1. Local Testing (Optional)

```bash
# Test locally first (optional)
node app.js
```

This should show:

```
🚀 cPanel Bot Server running on port 3000
📍 Base URL: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot
🔗 Webhook URL: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/webhook
```

### 2. Deploy to cPanel

1. **Upload all files** to your cPanel directory: `repositories/telegram-student-results-bot/`
2. **Ensure .env file** is uploaded with correct settings
3. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

### 3. Start the Application on cPanel

You need to start your Node.js application on cPanel. Methods vary by hosting provider:

#### Method A: cPanel Node.js App Manager

1. Go to cPanel → Node.js Apps
2. Create new app or restart existing
3. Set startup file: `app.js`
4. Set application root: `repositories/telegram-student-results-bot`

#### Method B: Command Line (if available)

```bash
cd repositories/telegram-student-results-bot
node app.js
```

#### Method C: PM2 (if available)

```bash
cd repositories/telegram-student-results-bot
pm2 start app.js --name "telegram-bot"
```

### 4. Verify Application is Running

Test these URLs in your browser:

✅ **Home**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/  
✅ **Status**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/status  
✅ **Health**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/health

**Expected Response** (Home):

```json
{
  "status": "Telegram Student Results Bot is running on cPanel",
  "timestamp": "2024-...",
  "version": "1.0.0",
  "environment": "cPanel Shared Hosting"
}
```

### 5. Set Up Webhook

Once your app is running, configure the webhook:

```bash
node setup-webhook.js
```

### 6. Test Bot Functionality

1. **Send a message** to @check_results_bot on Telegram
2. **Check logs** for any errors
3. **Verify webhook** is receiving updates

## Common Issues & Solutions

### Issue: 404 Errors on All Endpoints

**Cause**: Application not running on server  
**Solution**: Start the Node.js application using cPanel Node.js manager or command line

### Issue: "Cannot find module" errors

**Cause**: Dependencies not installed  
**Solution**: Run `npm install` in your project directory

### Issue: Database connection errors

**Cause**: Wrong credentials or database not accessible  
**Solution**: Verify DB_HOST, DB_USER, DB_PASSWORD in .env

### Issue: Webhook setup fails

**Cause**: Application not running or wrong URL  
**Solution**: Ensure app is running first, then run setup-webhook.js

### Issue: Bot doesn't respond to messages

**Cause**: Webhook not properly configured  
**Solution**:

1. Check webhook status: `node test-bot-setup.js`
2. Reconfigure webhook: `node setup-webhook.js`

## Quick Diagnostic Commands

```bash
# Test configuration and connectivity
node test-bot-setup.js

# Check webhook status
node -e "
const https = require('https');
const config = require('./config');
https.get(\`https://api.telegram.org/bot\${config.BOT_TOKEN}/getWebhookInfo\`, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});
"

# Test database connection
node -e "
const config = require('./config');
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME
});
conn.connect(err => {
  console.log(err ? 'DB Error: ' + err.message : 'DB Connected!');
  conn.end();
});
"
```

## Next Steps

1. **Start your Node.js app** on cPanel
2. **Verify endpoints** are responding (not 404)
3. **Run webhook setup**: `node setup-webhook.js`
4. **Test bot** by sending a message

## Support URLs

- **Bot Home**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/
- **Status**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/status
- **Health**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/health
- **Logs**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/logs
