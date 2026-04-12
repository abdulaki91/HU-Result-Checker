// Sync database schema with models
const { sequelize } = require("../config/database");
const { Student, Course } = require("../models/Student");
const User = require("../models/User");
const ColumnSetting = require("../models/ColumnSetting");

async function syncDatabase() {
  try {
    console.log("🔄 Starting database synchronization...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Sync all models (alter: true will add missing columns without dropping tables)
    await sequelize.sync({ alter: true });

    console.log("✅ Database schema synchronized successfully!");
    console.log("\nModels synced:");
    console.log("  - Users");
    console.log("  - Students");
    console.log("  - Courses");
    console.log("  - ColumnSettings");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database sync failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();
