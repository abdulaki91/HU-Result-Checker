const { Sequelize } = require("sequelize");

// Try to load .env file, but don't fail if it doesn't exist
try {
  require("dotenv").config();
  console.log("📄 Database config: .env file loaded");
} catch (error) {
  console.log(
    "⚠️  Database config: No .env file found, using environment variables",
  );
}

// Create sequelize instance - remote MySQL only
console.log("🔧 DB Config:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  passwordLength: process.env.DB_PASSWORD?.length || 0,
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false, // Disable all SQL query logging
    dialectOptions: {
      connectTimeout: 30000, // 30 seconds timeout
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000, // 30 seconds
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  },
);

// Test the connection - remote MySQL only
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error errno:", error.errno);
    console.error("❌ SQL state:", error.sqlState);
    console.error("❌ Full error:", error);
    throw error; // Don't continue without database
  }
};

module.exports = { sequelize, testConnection };
