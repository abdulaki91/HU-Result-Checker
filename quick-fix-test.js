#!/usr/bin/env node

const https = require("https");

console.log(
  "🔍 Testing different URL paths to find where your app is running...\n",
);

const baseUrls = [
  "https://checkresultbot.abdulaki.com",
  "https://checkresultbot.abdulaki.com/repositories/telegram-student-results-bot",
];

const endpoints = ["/", "/status", "/health"];

async function testUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          url,
          status: res.statusCode,
          response: data.substring(0, 200), // First 200 chars
        });
      });
    });

    request.on("error", (error) => {
      resolve({
        url,
        status: "ERROR",
        response: error.message,
      });
    });

    request.setTimeout(5000, () => {
      request.destroy();
      resolve({
        url,
        status: "TIMEOUT",
        response: "Request timed out",
      });
    });
  });
}

async function runTests() {
  for (const baseUrl of baseUrls) {
    console.log(`\n📍 Testing: ${baseUrl}`);
    console.log("─".repeat(50));

    for (const endpoint of endpoints) {
      const fullUrl = baseUrl + endpoint;
      const result = await testUrl(fullUrl);

      const statusIcon =
        result.status === 200
          ? "✅"
          : result.status === 404
            ? "❌"
            : result.status === "ERROR"
              ? "🔥"
              : "⏱️";

      console.log(`${statusIcon} ${result.status} - ${endpoint}`);

      if (result.status === 200) {
        try {
          const json = JSON.parse(result.response);
          if (json.status) {
            console.log(`   📝 Status: ${json.status}`);
          }
          if (json.bot) {
            console.log(`   🤖 Bot: ${json.bot}`);
          }
        } catch (e) {
          console.log(
            `   📄 Response: ${result.response.substring(0, 100)}...`,
          );
        }
      } else if (result.status === 404) {
        try {
          const json = JSON.parse(result.response);
          if (json.availableEndpoints) {
            console.log(
              `   📋 Available: ${json.availableEndpoints.join(", ")}`,
            );
          }
        } catch (e) {
          // Ignore parse errors for 404s
        }
      }
    }
  }

  console.log("\n🎯 Conclusion:");
  console.log(
    "Look for the URLs with ✅ 200 status - that's where your app is running!",
  );
}

runTests();
