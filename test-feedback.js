#!/usr/bin/env node

/**
 * Test script for feedback functionality
 * Tests both JSON and MySQL feedback storage
 */

const Database = require("./database");
const config = require("./config");

async function testFeedback() {
  console.log("🧪 Testing Feedback Functionality...\n");

  const database = new Database();

  try {
    // Initialize database
    await database.initialize();
    console.log("✅ Database initialized\n");

    // Test feedback data
    const testFeedback = {
      user_id: 123456789,
      student_id: "0014/14",
      user_name: "Test Student",
      user_username: "@teststudent",
      message: "This is a test feedback message. The bot works great!",
      created_at: new Date(),
    };

    console.log("📝 Saving test feedback...");
    const savedFeedback = await database.saveFeedback(testFeedback);
    console.log("✅ Feedback saved:", savedFeedback.id);

    // Test retrieving feedback
    console.log("\n📊 Retrieving recent feedback...");
    const recentFeedback = await database.getRecentFeedback(5);
    console.log(`✅ Retrieved ${recentFeedback.length} feedback entries:`);

    recentFeedback.forEach((feedback, index) => {
      console.log(`\n${index + 1}. ID: ${feedback.id}`);
      console.log(`   User: ${feedback.user_name} (${feedback.user_id})`);
      console.log(`   Student ID: ${feedback.student_id || "N/A"}`);
      console.log(`   Message: "${feedback.message}"`);
      console.log(`   Date: ${feedback.created_at}`);
    });

    console.log("\n🎉 Feedback functionality test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await database.close();
  }
}

// Run the test
if (require.main === module) {
  testFeedback().catch(console.error);
}

module.exports = { testFeedback };
