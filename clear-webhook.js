const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

async function clearWebhook() {
  const bot = new TelegramBot(config.BOT_TOKEN);

  try {
    console.log("🔧 Checking current webhook status...");

    // Get current webhook info
    const webhookInfo = await bot.getWebHookInfo();
    console.log("📋 Current Webhook Info:");
    console.log(`   URL: ${webhookInfo.url || "None"}`);
    console.log(`   Pending Updates: ${webhookInfo.pending_update_count}`);

    if (webhookInfo.url) {
      console.log("🗑️  Deleting existing webhook...");

      // Delete webhook
      const result = await bot.deleteWebHook();

      if (result) {
        console.log("✅ Webhook deleted successfully!");
        console.log("🎉 You can now run the bot in polling mode locally");
        console.log("💡 Use: npm run dev");
      } else {
        console.log("❌ Failed to delete webhook");
      }
    } else {
      console.log("ℹ️  No webhook is currently set");
      console.log(
        "🤔 The conflict might be from multiple bot instances running",
      );
      console.log("💡 Make sure to stop all other bot processes");
    }

    // Check for pending updates
    if (webhookInfo.pending_update_count > 0) {
      console.log(
        `⚠️  There are ${webhookInfo.pending_update_count} pending updates`,
      );
      console.log("💡 These will be processed when you start the bot");
    }
  } catch (error) {
    console.error("❌ Error clearing webhook:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  clearWebhook();
}

module.exports = clearWebhook;
