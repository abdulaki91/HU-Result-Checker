# Deployment Guide for Telegram Student Results Bot

## 🚀 **Hosting Your Bot**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Set Environment Variables**
Make sure your hosting platform has these environment variables:
```
BOT_TOKEN=your_telegram_bot_token
ADMIN_USER_ID=your_telegram_user_id
DB_HOST=your_mysql_host
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
DB_PORT=3306
WEBHOOK_URL=https://your-hosted-app-url.com
PORT=3000
```

### **Step 3: Deploy to Your Hosting Platform**

#### **For Heroku:**
```bash
# Set main file for webhook mode
echo "web: node webhook-bot.js" > Procfile

# Deploy
git add .
git commit -m "Deploy webhook bot"
git push heroku main
```

#### **For Railway/Render/Other Platforms:**
- Set start command to: `node webhook-bot.js`
- Make sure PORT environment variable is set

### **Step 4: Set Up Webhook**
After your app is deployed and running:

```bash
# Method 1: Using environment variable
WEBHOOK_URL=https://your-app-url.com node setup-webhook.js

# Method 2: Edit setup-webhook.js and replace YOUR_HOSTED_URL_HERE with your URL
node setup-webhook.js
```

### **Step 5: Verify Setup**
1. Visit `https://your-app-url.com` - should show "Bot is running"
2. Visit `https://your-app-url.com/health` - should show "OK"
3. Send `/start` to your bot on Telegram

## 🔧 **Configuration Options**

### **Local Development (Polling Mode):**
```bash
npm run dev
```

### **Production (Webhook Mode):**
```bash
npm run start:webhook
```

## 🌐 **Supported Hosting Platforms**

### **Heroku**
```bash
# Create app
heroku create your-bot-name

# Set environment variables
heroku config:set BOT_TOKEN=your_token
heroku config:set ADMIN_USER_ID=your_id
heroku config:set DB_HOST=your_db_host
# ... other variables

# Deploy
git push heroku main

# Set webhook
WEBHOOK_URL=https://your-bot-name.herokuapp.com node setup-webhook.js
```

### **Railway**
1. Connect your GitHub repo
2. Set environment variables in Railway dashboard
3. Deploy automatically
4. Set webhook using your Railway URL

### **Render**
1. Connect your GitHub repo
2. Set start command: `node webhook-bot.js`
3. Set environment variables
4. Deploy
5. Set webhook using your Render URL

### **DigitalOcean App Platform**
1. Create app from GitHub
2. Set run command: `node webhook-bot.js`
3. Configure environment variables
4. Deploy
5. Set webhook

## 🔍 **Troubleshooting**

### **Bot Not Responding:**
1. Check webhook status:
```bash
node -e "
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('YOUR_BOT_TOKEN');
bot.getWebHookInfo().then(console.log);
"
```

2. Check server logs for errors
3. Verify environment variables are set
4. Test webhook endpoint: `curl https://your-app.com/health`

### **Database Connection Issues:**
1. Verify database credentials
2. Check if database server allows external connections
3. Test connection: `npm run setup-db`

### **Common Issues:**
- **Port binding**: Make sure your app listens on `process.env.PORT`
- **HTTPS required**: Telegram webhooks require HTTPS
- **Webhook path**: Must match the path in your Express route
- **Bot token**: Double-check your bot token is correct

## 📝 **Environment Variables Reference**

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `ADMIN_USER_ID` | Your Telegram user ID | `123456789` |
| `WEBHOOK_URL` | Your hosted app URL | `https://mybot.herokuapp.com` |
| `PORT` | Server port (set by hosting platform) | `3000` |
| `DB_HOST` | MySQL host | `localhost` or cloud DB host |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | MySQL database name | `student_results` |
| `DB_PORT` | MySQL port | `3306` |

## 🎯 **Quick Setup Commands**

```bash
# 1. Install dependencies
npm install

# 2. Set up database (if using MySQL)
npm run setup-db

# 3. Start in webhook mode
npm run start:webhook

# 4. Set webhook (in another terminal)
WEBHOOK_URL=https://your-app-url.com npm run setup-webhook
```

Your bot should now be running in production mode! 🎉