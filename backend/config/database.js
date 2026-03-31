const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create sequelize instance with fallback to SQLite for development
const sequelize = new Sequelize(
  process.env.DB_NAME || "student_results",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      connectTimeout: 10000, // 10 seconds timeout
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 10000, // 10 seconds
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  },
);

// Test the connection with timeout
const testConnection = async () => {
  try {
    console.log("🔄 Testing MySQL connection...");
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 10000),
      ),
    ]);
    console.log("✅ MySQL connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    console.log("⚠️  Continuing without database for development...");
    return false;
  }
};

module.exports = { sequelize, testConnection };
