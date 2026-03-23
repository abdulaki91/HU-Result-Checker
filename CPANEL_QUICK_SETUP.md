# 🚀 Quick cPanel Setup Guide

## **Automated Setup (Recommended)**

### **Option 1: Use Deployment Script**

1. **Prepare locally:**

   ```bash
   # Copy environment template
   cp .env.cpanel.example .env

   # Edit .env with your values
   nano .env  # or use any text editor

   # Run automated deployment
   node deploy-cpanel.js
   ```

2. **Upload to cPanel:**
   - Upload all files to `public_html/telegram-bot/`
   - Follow the cPanel setup steps below

### **Option 2: Manual Setup**

## **Step-by-Step cPanel Deployment**

### **1. Prepare Environment File**

Copy `.env.cpanel.example` to `.env` and fill in your values:

```bash
# Required values
BOT_TOKEN=your_bot_token_from_botfather
ADMIN_USER_ID=your_telegram_user_id
CPANEL_DOMAIN=yourdomain.com

# Database (get from cPanel MySQL section)
DB_HOST=localhost
DB_USER=your_cpanel_mysql_username
DB_PASSWORD=your_cpanel_mysql_password
DB_NAME=your_cpanel_database_name

# Environment
NODE_ENV=production
USE_JSON_STORAGE=false
```

### **2. Upload Files to cPanel**

1. Login to your cPanel
2. Open **File Manager**
3. Go to `public_html`
4. Create folder: `telegram-bot`
5. Upload ALL your bot files to this folder (including `.env`)

### **3. Setup Node.js App in cPanel**

1. Find **"Node.js Apps"** in cPanel
2. Click **"Create Application"**
3. Fill in:
   - **Node.js Version**: Latest available (14+ recommended)
   - **Application Mode**: Production
   - **Application Root**: `telegram-bot`
   - **Application URL**: `telegram-bot`
   - **Application Startup File**: `app.js`
4. Click **"Create"**

### **4. Set Environment Variables in cPanel**

In the Node.js app settings, add these variables:

```
BOT_TOKEN=your_bot_token_from_botfather
ADMIN_USER_ID=your_telegram_user_id
DB_HOST=localhost
DB_USER=your_cpanel_mysql_username
DB_PASSWORD=your_cpanel_mysql_password
DB_NAME=your_cpanel_database_name
CPANEL_DOMAIN=yourdomain.com
BOT_PATH=/telegram-bot
NODE_ENV=production
USE_JSON_STORAGE=false
```

### **5. Setup MySQL Database**

1. Go to **"MySQL Databases"** in cPanel
2. Create database: `student_results` (will be prefixed with your username)
3. Create MySQL user and assign to database with ALL PRIVILEGES
4. Note the full database name and credentials

### **6. Install Dependencies & Setup**

In cPanel Terminal (if available) or SSH:

```bash
cd public_html/telegram-bot

# Install dependencies
npm install --production

# Setup database tables
node setup-database.js

# Setup webhook (replace yourdomain.com with your actual domain)
CPANEL_DOMAIN=yourdomain.com node setup-webhook-cpanel.js
```

### **7. Start Your Bot**

1. Go back to **Node.js Apps** in cPanel
2. Click **"Start"** next to your application
3. Check the logs for any errors

### **8. Test Your Bot**

1. **Check Status**: Visit `https://yourdomain.com/telegram-bot/`
2. **Health Check**: Visit `https://yourdomain.com/telegram-bot/health`
3. **Test Bot**: Send `/start` to your bot on Telegram

## **🔧 Your URLs:**

- **Bot Status**: `https://yourdomain.com/telegram-bot/`
- **Health Check**: `https://yourdomain.com/telegram-bot/health`
- **Bot API**: `https://yourdomain.com/telegram-bot/status`
- **Webhook URL**: `https://yourdomain.com/telegram-bot/webhook`

## **✅ Verification Checklist:**

- [ ] All files uploaded to `public_html/telegram-bot/`
- [ ] `.env` file created with correct values
- [ ] Node.js app created and started in cPanel
- [ ] Environment variables set in cPanel
- [ ] MySQL database created with user assigned
- [ ] Dependencies installed (`npm install`)
- [ ] Database tables created (`node setup-database.js`)
- [ ] Webhook configured (`node setup-webhook-cpanel.js`)
- [ ] Bot responds to `/start` command
- [ ] Status page accessible via HTTPS

## **🚨 Common Issues:**

### **Bot Not Responding:**

- Check webhook URL is correct and accessible
- Verify SSL certificate is active (HTTPS required)
- Check cPanel Node.js app logs for errors

### **Database Errors:**

- Verify database credentials in `.env`
- Ensure MySQL user has ALL PRIVILEGES
- Check if database tables were created properly

### **File Upload Issues:**

- Make sure all files are in `telegram-bot` folder
- Check file permissions (755 for folders, 644 for files)
- Verify `.env` file was uploaded

### **Webhook Errors:**

- Domain must have valid SSL certificate
- Check if domain is accessible via HTTPS
- Verify CPANEL_DOMAIN is set correctly

## **📞 Quick Commands:**

```bash
# Check bot status
curl https://yourdomain.com/telegram-bot/health

# Clear webhook (if needed)
node clear-webhook.js

# Restart webhook setup
CPANEL_DOMAIN=yourdomain.com node setup-webhook-cpanel.js

# Check database connection
node -e "const {Database} = require('./database'); const db = new Database(); db.initialize().then(() => console.log('✅ DB OK')).catch(console.error);"
```

## **📚 Need More Help?**

- **Full Guide**: `CPANEL_DEPLOYMENT.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Features**: `NEW_FEATURES_SUMMARY.md`

## **🎉 Success!**

Once everything is working:

1. Your bot will respond to `/start` on Telegram
2. Admins can upload Excel files with student data
3. Students can check their results by entering their ID
4. All data is stored securely in your cPanel MySQL database

**Your Telegram Student Results Bot is now live on cPanel! 🚀**
