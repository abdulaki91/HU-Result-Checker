#!/usr/bin/env node

/**
 * Test Configuration Script
 *
 * This script tests your .env configuration and shows all generated URLs
 */

const config = require("./config");

console.log("🔧 Testing Bot Configuration\n");

console.log("📋 Environment Variables:");
console.log(`   NODE_ENV: ${config.NODE_ENV}`);
console.log(`   BOT_TOKEN: ${config.BOT_TOKEN ? "✅ Set" : "❌ Missing"}`);
console.log(`   ADMIN_USER_ID: ${config.ADMIN_USER_ID || "❌ Missing"}`);
console.log(`   BOT_BASE_URL: ${config.BOT_BASE_URL || "Not set"}`);
console.log(`   CPANEL_DOMAIN: ${config.CPANEL_DOMAIN || "Not set"}`);
console.log(`   PROTOCOL: ${config.PROTOCOL}`);
console.log(`   BOT_PATH: ${config.BOT_PATH || "(root)"}`);
console.log(`   WEBHOOK_PATH: ${config.WEBHOOK_PATH}`);

console.log("\n🌐 Generated URLs:");
console.log(`   Base URL: ${config.FULL_BASE_URL || "❌ Cannot generate"}`);
console.log(
  `   Webhook URL: ${config.FULL_WEBHOOK_URL || "❌ Cannot generate"}`,
);
console.log(`   Status URL: ${config.FULL_STATUS_URL || "❌ Cannot generate"}`);
console.log(`   Health URL: ${config.FULL_HEALTH_URL || "❌ Cannot generate"}`);

console.log("\n🗄️  Database Configuration:");
console.log(`   Use JSON Storage: ${config.USE_JSON_STORAGE ? "Yes" : "No"}`);
if (config.USE_JSON_STORAGE) {
  console.log(`   JSON File Path: ${config.JSON_FILE_PATH}`);
} else {
  console.log(`   DB Host: ${config.DB_HOST}`);
  console.log(`   DB Port: ${config.DB_PORT}`);
  console.log(`   DB Name: ${config.DB_NAME}`);
  console.log(`   DB User: ${config.DB_USER}`);
  console.log(
    `   DB Password: ${config.DB_PASSWORD ? "✅ Set" : "❌ Missing"}`,
  );
}

console.log("\n⚙️  Other Settings:");
console.log(`   Max File Size: ${config.MAX_FILE_SIZE}`);
console.log(`   Temp Directory: ${config.TEMP_DIR}`);
console.log(`   Log Level: ${config.LOG_LEVEL}`);
console.log(`   Request Timeout: ${config.REQUEST_TIMEOUT}ms`);
console.log(`   Max Concurrent Uploads: ${config.MAX_CONCURRENT_UPLOADS}`);

console.log("\n✅ Configuration Test Complete!");

// Validation
const issues = [];

if (!config.BOT_TOKEN) {
  issues.push("BOT_TOKEN is missing");
}

if (!config.ADMIN_USER_ID) {
  issues.push("ADMIN_USER_ID is missing");
}

if (!config.FULL_WEBHOOK_URL) {
  issues.push(
    "Cannot generate webhook URL - set BOT_BASE_URL or CPANEL_DOMAIN",
  );
}

if (config.PROTOCOL === "http" && config.NODE_ENV === "production") {
  issues.push(
    "Using HTTP in production - Telegram requires HTTPS for webhooks",
  );
}

if (issues.length > 0) {
  console.log("\n⚠️  Issues Found:");
  issues.forEach((issue) => console.log(`   - ${issue}`));
} else {
  console.log("\n🎉 Configuration looks good!");
}

console.log("\n📚 Next Steps:");
console.log("1. Fix any issues shown above");
console.log("2. Run: node setup-database.js (if using MySQL)");
console.log("3. Run: node setup-webhook-cpanel.js");
console.log("4. Start your bot: node app.js");
console.log("5. Test by visiting your bot URLs in browser");
console.log("6. Send /start to your bot on Telegram");
