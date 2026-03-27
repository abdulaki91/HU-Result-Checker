#!/usr/bin/env node

const https = require("https");
const http = require("http");
const config = require("./config");

console.log("🔍 Bot Configuration Test\n");

// Test 1: Configuration Check
console.log("1️⃣ Configuration Check:");
console.log(`   BOT_TOKEN: ${config.BOT_TOKEN ? "✅ Set" : "❌ Missing"}`);
console.log(`   BOT_BASE_URL: ${config.BOT_BASE_URL || "Not set"}`);
console.log(`   BOT_PATH: ${config.BOT_PATH || "Not set"}`);
console.log(`   WEBHOOK_URL: ${config.WEBHOOK_URL || "Auto-generated"}`);
console.log(`   Database: ${config.USE_JSON_STORAGE ? "JSON File" : "MySQL"}`);

// Calculate correct URLs
const baseUrl = config.BOT_BASE_URL || "https://checkresultbot.abdulaki.com";
const botPath = config.BOT_PATH || "";
const webhookPath = config.WEBHOOK_PATH || "/webhook";

const correctUrls = {
  home: `${baseUrl}${botPath}/`,
  webhook: `${baseUrl}${botPath}${webhookPath}`,
  status: `${baseUrl}${botPath}/status`,
  health: `${baseUrl}${botPath}/health`,
  logs: `${baseUrl}${botPath}/logs`,
};

console.log("\n2️⃣ Expected URLs:");
Object.entries(correctUrls).forEach(([key, url]) => {
  console.log(`   ${key}: ${url}`);
});

// Test 2: Telegram API Connection
console.log("\n3️⃣ Testing Telegram API Connection...");
testTelegramAPI();

// Test 3: Bot Endpoints
console.log("\n4️⃣ Testing Bot Endpoints...");
setTimeout(() => {
  testBotEndpoints(correctUrls);
}, 2000);

// Test 4: Database Connection
console.log("\n5️⃣ Testing Database Connection...");
setTimeout(() => {
  testDatabase();
}, 4000);

function testTelegramAPI() {
  if (!config.BOT_TOKEN) {
    console.log("   ❌ No bot token found");
    return;
  }

  const url = `https://api.telegram.org/bot${config.BOT_TOKEN}/getMe`;

  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            console.log(`   ✅ Bot connected: @${result.result.username}`);
            console.log(`   📝 Bot name: ${result.result.first_name}`);
          } else {
            console.log(`   ❌ Telegram API error: ${result.description}`);
          }
        } catch (error) {
          console.log(
            `   ❌ Failed to parse Telegram response: ${error.message}`,
          );
        }
      });
    })
    .on("error", (error) => {
      console.log(`   ❌ Telegram API connection failed: ${error.message}`);
    });
}

function testBotEndpoints(urls) {
  const endpoints = ["home", "status", "health"];

  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testEndpoint(endpoint, urls[endpoint]);
    }, index * 1000);
  });
}

function testEndpoint(name, url) {
  const protocol = url.startsWith("https") ? https : http;

  const request = protocol.get(url, (res) => {
    console.log(
      `   ${name}: ${res.statusCode === 200 ? "✅" : "❌"} ${res.statusCode} - ${url}`,
    );

    if (res.statusCode !== 200) {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (data.length < 200) {
          console.log(`      Response: ${data}`);
        }
      });
    }
  });

  request.on("error", (error) => {
    console.log(`   ${name}: ❌ Connection failed - ${error.message}`);
  });

  request.setTimeout(10000, () => {
    console.log(`   ${name}: ❌ Timeout - ${url}`);
    request.destroy();
  });
}

function testDatabase() {
  if (config.USE_JSON_STORAGE) {
    console.log("   📁 Using JSON storage - checking file access...");
    const fs = require("fs");
    const path = require("path");

    try {
      const jsonPath = config.JSON_FILE_PATH || "./data/students.json";
      const dir = path.dirname(jsonPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✅ Created directory: ${dir}`);
      }

      if (!fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, "[]");
        console.log(`   ✅ Created JSON file: ${jsonPath}`);
      }

      const data = fs.readFileSync(jsonPath, "utf8");
      JSON.parse(data);
      console.log("   ✅ JSON storage is working");
    } catch (error) {
      console.log(`   ❌ JSON storage error: ${error.message}`);
    }
  } else {
    console.log("   🗄️ Testing MySQL connection...");
    try {
      const mysql = require("mysql2");
      const connection = mysql.createConnection({
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
      });

      connection.connect((error) => {
        if (error) {
          console.log(`   ❌ MySQL connection failed: ${error.message}`);
        } else {
          console.log("   ✅ MySQL connection successful");
          connection.end();
        }
      });
    } catch (error) {
      console.log(`   ❌ MySQL module error: ${error.message}`);
      console.log("   💡 Try: npm install mysql2");
    }
  }
}

// Test 5: Webhook Status
setTimeout(() => {
  console.log("\n6️⃣ Testing Webhook Status...");
  testWebhookStatus();
}, 6000);

function testWebhookStatus() {
  if (!config.BOT_TOKEN) {
    console.log("   ❌ No bot token for webhook test");
    return;
  }

  const url = `https://api.telegram.org/bot${config.BOT_TOKEN}/getWebhookInfo`;

  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            const info = result.result;
            console.log(`   Webhook URL: ${info.url || "Not set"}`);
            console.log(
              `   Pending updates: ${info.pending_update_count || 0}`,
            );
            console.log(`   Last error: ${info.last_error_message || "None"}`);

            if (info.url) {
              console.log("   ✅ Webhook is configured");
            } else {
              console.log("   ⚠️ No webhook set - bot may be in polling mode");
            }
          }
        } catch (error) {
          console.log(`   ❌ Failed to get webhook info: ${error.message}`);
        }
      });
    })
    .on("error", (error) => {
      console.log(`   ❌ Webhook status check failed: ${error.message}`);
    });
}

console.log("\n💡 Troubleshooting Tips:");
console.log("   • If endpoints fail: Check if your app is running on cPanel");
console.log("   • If webhook fails: Run setup-webhook.js to configure");
console.log("   • If database fails: Check credentials and permissions");
console.log(
  "   • If bot doesn't respond: Check webhook URL matches your setup",
);
