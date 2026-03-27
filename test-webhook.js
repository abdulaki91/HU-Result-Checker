#!/usr/bin/env node

const https = require("https");

console.log("🔍 Testing webhook endpoint...\n");

const testData = JSON.stringify({
  update_id: 123456789,
  message: {
    message_id: 1,
    from: {
      id: 664249810,
      is_bot: false,
      first_name: "Test",
      username: "testuser",
    },
    chat: {
      id: 664249810,
      first_name: "Test",
      username: "testuser",
      type: "private",
    },
    date: Math.floor(Date.now() / 1000),
    text: "/start",
  },
});

const options = {
  hostname: "checkresultbot.abdulaki.com",
  port: 443,
  path: "/webhook",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(testData),
  },
};

console.log(`📍 Testing: https://checkresultbot.abdulaki.com/webhook`);
console.log(`📦 Sending test webhook data...`);

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
      console.log("✅ Webhook endpoint is working!");
      console.log("🎉 Your bot should now be able to receive messages");
    } else if (res.statusCode === 404) {
      console.log("❌ Webhook endpoint not found (404)");
      console.log("💡 The /webhook route is not configured in your app");
    } else {
      console.log(`⚠️  Unexpected response: ${res.statusCode}`);
    }

    if (data) {
      console.log(`📄 Response: ${data}`);
    }
  });
});

req.on("error", (error) => {
  console.log(`❌ Request failed: ${error.message}`);
});

req.write(testData);
req.end();
