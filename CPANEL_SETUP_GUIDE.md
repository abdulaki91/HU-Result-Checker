# 🚀 cPanel Setup Guide for checkresultbot.abdulaki.com

## **Your Specific Configuration**

- **Domain**: `checkresultbot.abdulaki.com`
- **cPanel Path**: `repositories/telegram-student-results-bot`
- **Full URL**: `https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot`

## **Step 1: Upload Files to cPanel**

### **File Structure in cPanel:**

```
public_html/
├── repositories/
│   └── telegram-student-results-bot/    # Your bot files go here
│       ├── app.js                       # Main startup file
│       ├── package.json
│       ├── config.js
│       ├── .env                         # Your configuration
│       ├── src/
│       ├── logs/                        # Will be created automatically
│       └── ... (all other files)
```

### **Upload Method:**

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to `public_html`**
4. **Create folder structure**: `repositories/telegram-student-results-bot`
5. **Upload ALL your bot files** to this folder

## **Step 2: cPanel Node.js App Configuration**

### **In cPanel → Node.js Apps:**

```
Application Root: repositories/telegram-student-results-bot
Application Startup File: app.js
Application Mode: Production
Application URL: repositories/telegram-student-results-bot
Node.js Version: Latest available (14+)
```

### **Environment Variables in cPanel:**

```
BOT_TOKEN=8629682635:AAEj2q5-6v1vnKC2Yv2N_flGoE4ClCODtdA
ADMIN_USER_ID=664249810
BOT_BASE_URL=https://checkresultbot.abdulaki.com
CPANEL_DOMAIN=checkresultbot.abdulaki.com
BOT_PATH=/repositories/telegram-student-results-bot
NODE_ENV=production
DB_HOST=abdiko.com
DB_USER=abdulaki
DB_NAME=student-result
DB_PASSWORD=K9#mPe$vL8@nQ5!wu7&xT3%yU6^zB4*
USE_JSON_STORAGE=false
```

## **Step 3: Install Dependencies**

### **Method 1: cPanel Terminal (if available)**

```bash
cd public_html/repositories/telegram-student-results-bot
npm install
```

### **Method 2: cPanel File Manager**

1. Upload `node_modules` folder if you have it locally
2. Or use cPanel's npm install feature if available

## **Step 4: Setup Database**

### **In cPanel Terminal:**

```bash
cd public_html/repositories/telegram-student-results-bot
node setup-database.js
```

## **Step 5: Create Log Files**

### **Run this command:**

```bash
node create-logs.js
```

This will create:

- `logs/errors.log` - Error messages
- `logs/app.log` - Application logs
- `logs/cpanel-issues.log` - cPanel specific issues

## **Step 6: Start the Application**

### **In cPanel Node.js Apps:**

1. **Click "Start"** on your application
2. **Check status** - should show "Running"
3. **Check logs** for any errors

## **Step 7: Setup Webhook**

### **Run webhook setup:**

```bash
node setup-webhook-cpanel.js
```

This will configure Telegram webhook to:
`https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/webhook`

## **Step 8: Test Your Bot**

### **Your Bot URLs:**

- **Home**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/
- **Status**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/status
- **Health**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/health
- **Logs**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/logs
- **Webhook**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/webhook

### **Test Steps:**

1. **Visit status URL** - should show bot information
2. **Send `/start` to your bot** on Telegram
3. **Check logs URL** for any errors

## **Step 9: View Error Logs**

### **Method 1: Via Browser**

Visit: `https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/logs`

### **Method 2: cPanel File Manager**

Navigate to: `repositories/telegram-student-results-bot/logs/`

- Click on `errors.log` to view errors
- Click on `app.log` to view all logs

### **Method 3: cPanel Terminal**

```bash
cd public_html/repositories/telegram-student-results-bot
node view-errors.js
```

### **Method 4: Real-time monitoring**

```bash
tail -f logs/errors.log
```

## **Troubleshooting Your Setup**

### **If you see 404 errors:**

1. **Check cPanel Node.js app status** - must be "Running"
2. **Verify file path**: `repositories/telegram-student-results-bot`
3. **Check Application URL** in cPanel Node.js settings

### **If dependencies are missing:**

```bash
cd public_html/repositories/telegram-student-results-bot
npm install
```

### **If database connection fails:**

1. **Check DB credentials** in cPanel environment variables
2. **Verify database exists** in cPanel MySQL Databases
3. **Test connection**: `node setup-database.js`

### **If webhook setup fails:**

1. **Check domain accessibility**: Visit your status URL
2. **Verify bot token** is correct
3. **Try manual webhook setup**

## **Quick Diagnostic Commands**

### **Test configuration:**

```bash
node test-config.js
```

### **View all logs:**

```bash
node view-errors.js
```

### **Check system info:**

```bash
node view-errors.js --system
```

### **See only errors:**

```bash
node view-errors.js --errors-only
```

## **Your Complete Setup Checklist**

- [ ] Files uploaded to `repositories/telegram-student-results-bot/`
- [ ] cPanel Node.js app created with correct paths
- [ ] Environment variables set in cPanel
- [ ] Dependencies installed (`npm install`)
- [ ] Database setup completed
- [ ] Log files created
- [ ] Application started in cPanel
- [ ] Webhook configured
- [ ] Status URL accessible
- [ ] Bot responds to `/start` on Telegram

## **Support URLs for Your Bot**

- **Main Bot**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/
- **Status Check**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/status
- **Health Check**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/health
- **Error Logs**: https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot/logs

Your bot should now be fully operational on cPanel! 🎉
