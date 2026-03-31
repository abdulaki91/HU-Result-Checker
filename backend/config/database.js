const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create sequelize instance - remote MySQL only
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
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
    console.log(
      `🔄 Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}...`,
    );
    await sequelize.authenticate();
    console.log("✅ MySQL connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    throw error; // Don't continue without database
  }
};

module.exports = { sequelize, testConnection };
