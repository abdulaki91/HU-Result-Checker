# 🚀 cPanel Deployment Checklist

## Pre-Deployment

- [x] ✅ Bot token configured (@check_results_bot)
- [x] ✅ Database connection working
- [x] ✅ Domain URLs updated to checkresultbot.abdulaki.com
- [ ] ⏳ Application running on server

## Deployment Steps

### 1. Upload Files to cPanel

Upload these files to `repositories/telegram-student-results-bot/`:

```
├── .env (with your settings)
├── app.js
├── config.js
├── setup-webhook.js
├── package.json
├── src/ (entire folder)
├── data/ (if using JSON storage)
└── logs/ (will be created)
```

### 2. Install Dependencies

In cPanel File Manager terminal or SSH:

```bash
cd repositories/telegram-student-results-bot
npm install
```

### 3. Start the Application

Choose one method:

#### Option A: cPanel Node.js App Manager (Recommended)

1. Go to cPanel → Node.js Apps
2. Click "Create Application"
3. Set:
   - **Node.js Version**: Latest available
   - **Application Mode**: Production
   - **Application Root**: `repositories/telegram-student-results-bot`
   - **Application URL**: `checkresultbot.abdulaki.com/repositories/telegram-student-results-bot`
   - **Application Startup File**: `app.js`
4. Click "Create"
5. Click "Start" to run the application

#### Option B: Command Line (if SSH available)

```bash
cd repositories/telegram-student-results-bot
node app.js
```

#### Option C: PM2 Process Manager (if available)

```bash
cd repositories/telegram-student-results-bot
npm install -g pm2
pm2 start app.js --name "telegram-bot"
pm2 save
pm2 startup
```

### 4. Verify Application is Running

Test these URLs (should return JSON, not 404):

✅ **Home**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/
✅ **Status**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/status
✅ **Health**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/health

### 5. Configure Webhook

Once app is running:

```bash
node setup-webhook.js
```

### 6. Test Bot

1. Send message to @check_results_bot
2. Check if bot responds
3. Monitor logs for errors

## Troubleshooting

### App Not Starting

```bash
# Check Node.js version
node --version

# Check for missing dependencies
npm install

# Check for syntax errors
node -c app.js

# Check logs
tail -f logs/app.log
```

### 404 Errors

- Verify app is running in cPanel Node.js Apps
- Check application root path is correct
- Ensure startup file is `app.js`

### Webhook Errors

- Ensure HTTPS is working on your domain
- Check SSL certificate is valid
- Verify webhook URL is accessible

### Database Errors

- Check .env database credentials
- Verify database exists and user has permissions
- Test connection: `node -e "require('./config'); console.log('Config loaded')"`

## Quick Tests

```bash
# Test configuration
node test-bot-setup.js

# Test webhook setup
node setup-webhook.js

# Check webhook status
curl https://api.telegram.org/bot8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA/getWebhookInfo
```

## Success Indicators

- [ ] All URLs return JSON (not 404)
- [ ] Webhook setup completes without errors
- [ ] Bot responds to Telegram messages
- [ ] No errors in application logs

## Support

If you encounter issues:

1. Check cPanel error logs
2. Review application logs in `logs/` folder
3. Verify all environment variables in `.env`
4. Test individual components with diagnostic scripts
