#!/usr/bin/env node

/**
 * Temporary Polling Mode Bot
 *
 * Use this while setting up SSL certificate
 * Polling mode doesn't require HTTPS
 */

const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const config = require("./config");

async function startPollingBot() {
  console.log("🔄 Starting Telegram Bot in Polling Mode");
  console.log(
    "⚠️  This is temporary - switch to webhook mode with HTTPS for production\n",
  );

  try {
    // Clear any existing webhook first
    console.log("🧹 Clearing existing webhook...");
    const clearWebhook = require("./clear-webhook");
    await clearWebhook();

    // Start bot in polling mode
    console.log("🤖 Initializing bot in polling mode...");
    const bot = new StudentResultsBot(false); // false = polling mode
    await bot.initialize();

    console.log("✅ Bot successfully started in polling mode!");
    console.log("📱 Your bot is now ready to receive messages on Telegram");
    console.log("🔍 Send /start to your bot to test it");

    console.log("\n📋 Bot Information:");
    console.log(`   Bot Token: ${config.BOT_TOKEN ? "✅ Set" : "❌ Missing"}`);
    console.log(`   Admin User ID: ${config.ADMIN_USER_ID || "❌ Missing"}`);
    console.log(
      `   Database: ${config.USE_JSON_STORAGE ? "JSON File" : "MySQL"}`,
    );
    console.log(`   Mode: Polling (No HTTPS required)`);

    console.log("\n🔒 SSL Setup Reminder:");
    console.log("   1. Get SSL certificate for checkresultbot.abdulaki.com");
    console.log("   2. Update .env to use https://");
    console.log("   3. Switch to webhook mode: node app.js");
    console.log("   4. Setup webhook: node setup-webhook-cpanel.js");

    console.log("\n⏹️  To stop the bot: Press Ctrl+C");
  } catch (error) {
    console.error("❌ Failed to start polling bot:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Database connection issue:");
      console.log("   - Check database credentials in .env");
      console.log("   - Verify database server is running");
      console.log("   - Try: node setup-database.js");
    }

    if (error.message.includes("MODULE_NOT_FOUND")) {
      console.log("\n💡 Missing dependencies:");
      console.log("   - Run: npm install");
      console.log("   - Check if all files are uploaded");
    }

    if (error.message.includes("401")) {
      console.log("\n💡 Bot token issue:");
      console.log("   - Check BOT_TOKEN in .env file");
      console.log("   - Verify token with @BotFather");
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down polling bot...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down polling bot...");
  process.exit(0);
});

// Handle errors
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

// Start the bot
if (require.main === module) {
  startPollingBot();
}

module.exports = startPollingBot;
