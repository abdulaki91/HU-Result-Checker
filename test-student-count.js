#!/usr/bin/env node

/**
 * Test script to verify student count functionality
 */

const Database = require("./database");
const config = require("./config");

async function testStudentCount() {
  console.log("🧪 Testing Student Count Functionality...\n");

  const database = new Database();

  try {
    // Initialize database
    console.log("📊 Initializing database...");
    await database.initialize();
    console.log("✅ Database initialized\n");

    // Test student count
    console.log("👥 Getting student count...");
    const studentCount = await database.getStudentCount();
    console.log(`✅ Student count: ${studentCount}`);

    // Show storage type
    const storageType = config.USE_JSON_STORAGE ? "JSON File" : "MySQL";
    console.log(`💾 Storage type: ${storageType}`);

    // If JSON storage, show file info
    if (config.USE_JSON_STORAGE) {
      const fs = require("fs");
      const path = require("path");

      const jsonPath =
        config.JSON_FILE_PATH || path.join(__dirname, "data/students.json");
      console.log(`📁 JSON file path: ${jsonPath}`);

      if (fs.existsSync(jsonPath)) {
        const stats = fs.statSync(jsonPath);
        console.log(`📄 File size: ${stats.size} bytes`);
        console.log(`📅 Last modified: ${stats.mtime}`);

        // Read and parse JSON to verify
        try {
          const data = fs.readFileSync(jsonPath, "utf8");
          const students = JSON.parse(data);
          console.log(`📊 JSON array length: ${students.length}`);

          if (students.length > 0) {
            console.log(
              `👤 Sample student: ${students[0].student_name || students[0].name} (${students[0].student_id || students[0].id})`,
            );
          }
        } catch (parseError) {
          console.error("❌ Error parsing JSON:", parseError.message);
        }
      } else {
        console.log("⚠️ JSON file does not exist");
      }
    }

    // If MySQL, show connection info
    if (!config.USE_JSON_STORAGE) {
      console.log(`🗄️ MySQL Host: ${config.DB_HOST}:${config.DB_PORT}`);
      console.log(`🗄️ MySQL Database: ${config.DB_NAME}`);

      // Test direct query
      try {
        const [rows] = await database.connection.execute(
          "SELECT COUNT(*) as count FROM students",
        );
        console.log(`📊 Direct MySQL count: ${rows[0].count}`);
      } catch (queryError) {
        console.error("❌ Direct MySQL query error:", queryError.message);
      }
    }

    console.log("\n🎉 Student count test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await database.close();
  }
}

// Run the test
if (require.main === module) {
  testStudentCount().catch(console.error);
}

module.exports = { testStudentCount };
