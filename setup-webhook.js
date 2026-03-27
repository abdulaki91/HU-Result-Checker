const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

async function setupWebhook() {
  const bot = new TelegramBot(config.BOT_TOKEN);

  // Replace with your actual hosted URL
  const WEBHOOK_URL =
    process.env.WEBHOOK_URL || "https://checkresultbot.abdiko.com";

  if (WEBHOOK_URL === "https://checkresultbot.abdiko.com") {
    console.log(
      "❌ Please set your WEBHOOK_URL environment variable or update this script",
    );
    console.log(
      "Example: WEBHOOK_URL=https://your-app.herokuapp.com node setup-webhook.js",
    );
    process.exit(1);
  }

  const webhookPath = `/webhook/${config.BOT_TOKEN}`;
  const fullWebhookUrl = `${WEBHOOK_URL}${webhookPath}`;

  try {
    console.log(`🔧 Setting up webhook: ${fullWebhookUrl}`);

    // Delete existing webhook
    await bot.deleteWebHook();
    console.log("✅ Deleted existing webhook");

    // Set new webhook
    const result = await bot.setWebHook(fullWebhookUrl);

    if (result) {
      console.log("✅ Webhook set successfully!");

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
      console.log(`   Max Connections: ${webhookInfo.max_connections}`);

      if (webhookInfo.last_error_date) {
        console.log(
          `   Last Error: ${new Date(webhookInfo.last_error_date * 1000)}`,
        );
        console.log(`   Last Error Message: ${webhookInfo.last_error_message}`);
      }
    } else {
      console.log("❌ Failed to set webhook");
    }
  } catch (error) {
    console.error("❌ Error setting up webhook:", error.message);
  }
}

// Run if called directly
if (require.main === module) {
  setupWebhook();
}

module.exports = setupWebhook;
