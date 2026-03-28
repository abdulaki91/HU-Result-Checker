#!/usr/bin/env node

// Load development environment
require("dotenv").config({ path: ".env.dev" });

const TelegramBot = require("node-telegram-bot-api");
const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const config = require("./config");

console.log("� Starting Development Bot...");
console.log("📍 Mode: Polling (no webhook needed)");
console.log("🗄️ Storage: JSON File");
console.log("� Bot Token:", process.env.BOT_TOKEN ? "✅ Set" : "❌ Missing");

async function startDevelopmentBot() {
  try {
    // First, clear any existing webhook
    const tempBot = new TelegramBot(config.BOT_TOKEN);

    console.log("🗑️  Clearing webhook for local development...");
    await tempBot.deleteWebHook();
    console.log("✅ Webhook cleared");

    // Wait a moment for Telegram to process the webhook deletion
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create bot in polling mode (useWebhook = false)
    const bot = new StudentResultsBot(false);
    await bot.initialize();

    console.log("✅ Development bot is running!");
    console.log("💬 Send messages to your bot on Telegram to test");
    console.log("🛑 Press Ctrl+C to stop");

    // Graceful shutdown handlers
    process.on("SIGINT", async () => {
      Logger.info("Received SIGINT, shutting down gracefully...");
      await bot.shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      Logger.info("Received SIGTERM, shutting down gracefully...");
      await bot.shutdown();
      process.exit(0);
    });

    process.on("uncaughtException", (error) => {
      Logger.error("Uncaught Exception:", error.message);
      Logger.error(error.stack);
    });

    process.on("unhandledRejection", (reason, promise) => {
      Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
  } catch (error) {
    console.error("❌ Failed to start development bot:", error.message);

    if (error.message.includes("409") || error.message.includes("Conflict")) {
      console.log("\n💡 Troubleshooting steps:");
      console.log("1. Make sure no other bot instances are running");
      console.log(
        "2. Check if you have the bot running on your hosting platform",
      );
      console.log("3. Wait 1-2 minutes and try again");
      console.log("4. Run: node clear-webhook.js");
    }

    process.exit(1);
  }
}

startDevelopmentBot();
