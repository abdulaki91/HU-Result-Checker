# cPanel Deployment Guide for Telegram Student Results Bot

## 🏠 **Deploying to cPanel Shared Hosting**

### **Prerequisites:**

- cPanel hosting account with Node.js support
- MySQL database access
- SSL certificate (for HTTPS - required by Telegram)

## 📁 **Step 1: Prepare Files for cPanel**

### **File Structure for cPanel:**

```
public_html/
├── telegram-bot/
│   ├── app.js (main entry point)
│   ├── package.json
│   ├── src/
│   ├── database.js
│   ├── config.js
│   ├── excelService.js
│   └── temp/
```

### **Important cPanel Considerations:**

1. **Entry Point**: cPanel usually expects `app.js` as the main file
2. **Port**: cPanel assigns ports automatically
3. **Path**: Your bot will be accessible at `https://yourdomain.com/telegram-bot/`
4. **Node.js Version**: Check your cPanel Node.js version

## 🔧 **Step 2: Create cPanel-Specific Files**

### **Create app.js (cPanel Entry Point):**

```javascript
const express = require("express");
const path = require("path");
const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const config = require("./config");

const app = express();

// cPanel specific configuration
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "/telegram-bot";

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: "Telegram Student Results Bot is running on cPanel",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: "cPanel Shared Hosting",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/status", (req, res) => {
  res.json({
    bot: "Student Results Bot",
    status: "Active",
    mode: "Webhook",
    timestamp: new Date().toISOString(),
  });
});

// Initialize bot
let bot;

async function initializeBot() {
  try {
    bot = new StudentResultsBot(true); // Webhook mode
    await bot.initialize();

    // Webhook endpoint - cPanel specific path
    app.post("/webhook", (req, res) => {
      try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        Logger.error("Webhook processing error:", error.message);
        res.sendStatus(500);
      }
    });

    // Alternative webhook path with token (more secure)
    app.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
      try {
        bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        Logger.error("Webhook processing error:", error.message);
        res.sendStatus(500);
      }
    });

    Logger.info("✅ Bot initialized in webhook mode for cPanel");
  } catch (error) {
    Logger.error("❌ Failed to initialize bot:", error.message);
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  Logger.error("Express error:", error.message);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 cPanel Bot Server running on port ${PORT}`);
  console.log(`📍 Base URL: https://yourdomain.com${BASE_PATH}`);
  await initializeBot();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Received SIGINT, shutting down gracefully...");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("Received SIGTERM, shutting down gracefully...");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception:", error.message);
  Logger.error(error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
```

## 📋 **Step 3: Update package.json for cPanel**

```json
{
  "name": "telegram-student-results-bot",
  "version": "1.0.0",
  "description": "Telegram bot for managing and checking student results",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "setup-db": "node setup-database.js",
    "setup-webhook": "node setup-webhook-cpanel.js"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.66.0",
    "xlsx": "^0.18.5",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "express": "^4.18.2"
  }
}
```

## 🔧 **Step 4: cPanel-Specific Webhook Setup**

### **Create setup-webhook-cpanel.js:**

```javascript
const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

async function setupWebhookCPanel() {
  const bot = new TelegramBot(config.BOT_TOKEN);

  // Your cPanel domain and path
  const DOMAIN = process.env.CPANEL_DOMAIN || "yourdomain.com";
  const BOT_PATH = process.env.BOT_PATH || "/telegram-bot";

  if (DOMAIN === "yourdomain.com") {
    console.log(
      "❌ Please set your CPANEL_DOMAIN environment variable or update this script",
    );
    console.log(
      "Example: CPANEL_DOMAIN=yourdomain.com node setup-webhook-cpanel.js",
    );
    process.exit(1);
  }

  // Use simple webhook path for cPanel
  const webhookPath = "/webhook";
  const fullWebhookUrl = `https://${DOMAIN}${BOT_PATH}${webhookPath}`;

  try {
    console.log(`🔧 Setting up cPanel webhook: ${fullWebhookUrl}`);

    // Delete existing webhook
    await bot.deleteWebHook();
    console.log("✅ Deleted existing webhook");

    // Set new webhook
    const result = await bot.setWebHook(fullWebhookUrl);

    if (result) {
      console.log("✅ cPanel Webhook set successfully!");
      console.log(`📍 Webhook URL: ${fullWebhookUrl}`);

      // Get webhook info to verify
      const webhookInfo = await bot.getWebHookInfo();
      console.log("📋 Webhook Info:");
      console.log(`   URL: ${webhookInfo.url}`);
      console.log(
        `   Has Custom Certificate: ${webhookInfo.has_custom_certificate}`,
      );
      console.log(
        `   Pending Update Count: ${webhookInfo.pending_update_count}`,
      );

      if (webhookInfo.last_error_date) {
        console.log(
          `   ⚠️  Last Error: ${new Date(webhookInfo.last_error_date * 1000)}`,
        );
        console.log(
          `   ⚠️  Last Error Message: ${webhookInfo.last_error_message}`,
        );
      } else {
        console.log("   ✅ No webhook errors");
      }

      console.log("\n🎉 Setup complete! Your bot should now work on cPanel.");
      console.log(`📱 Test by sending /start to your bot on Telegram`);
      console.log(`🌐 Bot status: https://${DOMAIN}${BOT_PATH}/status`);
    } else {
      console.log("❌ Failed to set webhook");
    }
  } catch (error) {
    console.error("❌ Error setting up cPanel webhook:", error.message);

    if (error.message.includes("HTTPS")) {
      console.log("\n💡 Make sure your domain has SSL certificate (HTTPS)");
      console.log("   Telegram webhooks require HTTPS connections");
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupWebhookCPanel();
}

module.exports = setupWebhookCPanel;
```

## 🗄️ **Step 5: cPanel Database Configuration**

### **Update config.js for cPanel:**

```javascript
require("dotenv").config();

module.exports = {
  // Bot Configuration
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  ADMIN_USER_ID: parseInt(process.env.ADMIN_USER_ID) || 0,

  // Database Configuration (cPanel MySQL)
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "",

  // Storage Configuration
  USE_JSON_STORAGE: process.env.USE_JSON_STORAGE === "true" || false,
  JSON_FILE_PATH: process.env.JSON_FILE_PATH || "./data/students.json",

  // cPanel specific
  CPANEL_DOMAIN: process.env.CPANEL_DOMAIN || "",
  BOT_PATH: process.env.BOT_PATH || "/telegram-bot",
};
```

## 📤 **Step 6: Upload to cPanel**

### **Method 1: File Manager**

1. Login to cPanel
2. Open File Manager
3. Navigate to `public_html`
4. Create folder `telegram-bot`
5. Upload all your bot files to this folder
6. Extract if uploaded as ZIP

### **Method 2: FTP/SFTP**

```bash
# Using FTP client or command line
ftp yourdomain.com
# Upload files to public_html/telegram-bot/
```

## ⚙️ **Step 7: cPanel Node.js Setup**

### **In cPanel:**

1. Go to **"Node.js Apps"** or **"Setup Node.js App"**
2. Click **"Create Application"**
3. Set:
   - **Node.js Version**: Latest available (14+ recommended)
   - **Application Mode**: Production
   - **Application Root**: `telegram-bot`
   - **Application URL**: `telegram-bot` (or your preferred path)
   - **Application Startup File**: `app.js`

4. Click **"Create"**

### **Environment Variables in cPanel:**

Add these in the Node.js app environment variables:

```
BOT_TOKEN=your_telegram_bot_token
ADMIN_USER_ID=your_telegram_user_id
DB_HOST=localhost
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_cpanel_db_name
CPANEL_DOMAIN=yourdomain.com
BOT_PATH=/telegram-bot
```

## 🗄️ **Step 8: Setup MySQL Database**

### **In cPanel:**

1. Go to **"MySQL Databases"**
2. Create database: `your_username_student_results`
3. Create user and assign to database
4. Note the full database name (usually prefixed with your username)

### **Run Database Setup:**

```bash
# SSH into your cPanel account (if available) or use cPanel Terminal
cd public_html/telegram-bot
node setup-database.js
```

## 🔗 **Step 9: Set Webhook**

### **Method 1: Using cPanel Terminal (if available):**

```bash
cd public_html/telegram-bot
CPANEL_DOMAIN=yourdomain.com node setup-webhook-cpanel.js
```

### **Method 2: Using your local machine:**

```bash
# Edit setup-webhook-cpanel.js and set your domain
# Then run locally:
node setup-webhook-cpanel.js
```

## ✅ **Step 10: Test Your Bot**

1. **Check Status**: Visit `https://yourdomain.com/telegram-bot/`
2. **Health Check**: Visit `https://yourdomain.com/telegram-bot/health`
3. **Bot Status**: Visit `https://yourdomain.com/telegram-bot/status`
4. **Test Bot**: Send `/start` to your bot on Telegram

## 🔧 **Troubleshooting cPanel Issues**

### **Common cPanel Problems:**

1. **Node.js Not Available**: Contact your hosting provider
2. **Port Issues**: cPanel handles ports automatically
3. **SSL Certificate**: Ensure your domain has HTTPS
4. **File Permissions**: Set correct permissions (755 for folders, 644 for files)
5. **Database Connection**: Use localhost and correct cPanel database credentials

### **Debug Commands:**

```bash
# Check Node.js version
node --version

# Check if app starts
node app.js

# Test database connection
node setup-database.js

# Check webhook status
node -e "
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('YOUR_BOT_TOKEN');
bot.getWebHookInfo().then(console.log);
"
```

## 📝 **cPanel Checklist:**

- [ ] Node.js app created in cPanel
- [ ] All files uploaded to `public_html/telegram-bot/`
- [ ] Environment variables set in cPanel
- [ ] MySQL database created and configured
- [ ] SSL certificate active (HTTPS)
- [ ] Webhook configured with your domain
- [ ] Bot responds to `/start` command

Your Telegram bot should now be running on cPanel! 🎉

## 💡 **Pro Tips for cPanel:**

1. **Use cPanel File Manager** for easy file management
2. **Enable Error Logs** in cPanel to debug issues
3. **Set up Cron Jobs** if you need scheduled tasks
4. **Use cPanel Backup** to backup your bot regularly
5. **Monitor Resource Usage** to avoid hitting limits
