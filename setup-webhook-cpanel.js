const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

async function setupWebhookCPanel() {
  const bot = new TelegramBot(config.BOT_TOKEN);

  // Get webhook URL from config
  const webhookUrl = config.FULL_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("❌ Webhook URL not configured!");
    console.log("Please set one of the following in your .env file:");
    console.log("  - BOT_BASE_URL=http://checkresultbot.abdiko.com");
    console.log("  - CPANEL_DOMAIN=checkresultbot.abdiko.com");
    console.log("  - WEBHOOK_URL=http://checkresultbot.abdiko.com/webhook");
    process.exit(1);
  }

  try {
    console.log(`🔧 Setting up cPanel webhook: ${webhookUrl}`);

    // Delete existing webhook
    await bot.deleteWebHook();
    console.log("✅ Deleted existing webhook");

    // Set new webhook
    const result = await bot.setWebHook(webhookUrl);

    if (result) {
      console.log("✅ cPanel Webhook set successfully!");
      console.log(`📍 Webhook URL: ${webhookUrl}`);

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

      // Show all available URLs
      console.log("\n🌐 Your Bot URLs:");
      console.log(`   Bot Home: ${config.FULL_BASE_URL}`);
      console.log(`   Webhook: ${config.FULL_WEBHOOK_URL}`);
      console.log(`   Status: ${config.FULL_STATUS_URL}`);
      console.log(`   Health: ${config.FULL_HEALTH_URL}`);
    } else {
      console.log("❌ Failed to set webhook");
    }
  } catch (error) {
    console.error("❌ Error setting up cPanel webhook:", error.message);

    if (error.message.includes("HTTPS")) {
      console.log("\n💡 HTTPS Issue:");
      console.log("   Telegram webhooks require HTTPS connections");
      console.log(
        "   Your current URL uses HTTP - consider getting SSL certificate",
      );
      console.log("   Or use polling mode for testing: node bot.js");
    }

    if (error.message.includes("getaddrinfo")) {
      console.log("\n💡 DNS/Domain issue detected:");
      console.log("   - Make sure your domain is properly configured");
      console.log("   - Check if your site is accessible via browser");
      console.log("   - Verify the domain spelling is correct");
    }

    if (error.message.includes("timeout")) {
      console.log("\n💡 Timeout issue:");
      console.log("   - Your server might be slow to respond");
      console.log("   - Check if your cPanel app is running");
      console.log("   - Try accessing your bot URL in browser first");
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupWebhookCPanel();
}

module.exports = setupWebhookCPanel;
