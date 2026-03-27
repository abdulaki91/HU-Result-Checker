const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

async function setupWebhook() {
  console.log("🔧 Setting up Telegram webhook for cPanel...");

  if (!config.BOT_TOKEN) {
    console.log("❌ BOT_TOKEN not found in .env file");
    process.exit(1);
  }

  if (!config.FULL_WEBHOOK_URL) {
    console.log("❌ Webhook URL could not be generated from config");
    console.log("   Check BOT_BASE_URL and BOT_PATH in .env file");
    process.exit(1);
  }

  const bot = new TelegramBot(config.BOT_TOKEN);
  const webhookUrl = config.FULL_WEBHOOK_URL;

  try {
    console.log(`📍 Webhook URL: ${webhookUrl}`);

    // Delete existing webhook first
    console.log("🗑️  Deleting existing webhook...");
    await bot.deleteWebHook();
    console.log("✅ Deleted existing webhook");

    // Wait a moment before setting new webhook
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Set new webhook
    console.log("🔗 Setting new webhook...");
    const result = await bot.setWebHook(webhookUrl, {
      max_connections: 40,
      allowed_updates: ["message", "callback_query", "inline_query"],
    });

    if (result) {
      console.log("✅ Webhook set successfully!");

      // Verify webhook setup
      console.log("🔍 Verifying webhook setup...");
      const webhookInfo = await bot.getWebHookInfo();

      console.log("\n📋 Webhook Information:");
      console.log(`   URL: ${webhookInfo.url}`);
      console.log(
        `   Has Custom Certificate: ${webhookInfo.has_custom_certificate}`,
      );
      console.log(`   Pending Updates: ${webhookInfo.pending_update_count}`);
      console.log(`   Max Connections: ${webhookInfo.max_connections}`);
      console.log(
        `   Allowed Updates: ${webhookInfo.allowed_updates?.join(", ") || "All"}`,
      );

      if (webhookInfo.last_error_date) {
        console.log(
          `\n⚠️  Last Error: ${new Date(webhookInfo.last_error_date * 1000)}`,
        );
        console.log(`   Error Message: ${webhookInfo.last_error_message}`);
      } else {
        console.log("\n✅ No recent errors");
      }

      console.log("\n🎉 Webhook setup complete!");
      console.log("\n📝 Next steps:");
      console.log("   1. Send a message to your bot on Telegram");
      console.log("   2. Check your app logs for incoming webhook requests");
      console.log(`   3. Monitor status at: ${config.FULL_STATUS_URL}`);
    } else {
      console.log("❌ Failed to set webhook");
    }
  } catch (error) {
    console.error("❌ Error setting up webhook:", error.message);

    if (error.message.includes("HTTPS")) {
      console.log("\n💡 Troubleshooting:");
      console.log("   • Ensure your server supports HTTPS");
      console.log("   • Check if SSL certificate is valid");
      console.log("   • Verify the webhook URL is accessible");
    }

    if (error.message.includes("getaddrinfo")) {
      console.log("\n💡 Troubleshooting:");
      console.log("   • Check if the domain name is correct");
      console.log("   • Ensure DNS is properly configured");
      console.log("   • Verify the server is running and accessible");
    }
  }
}

// Run if called directly
if (require.main === module) {
  setupWebhook();
}

module.exports = setupWebhook;
