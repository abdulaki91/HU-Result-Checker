const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  console.log("=== Detailed Database Connection Test ===");
  console.log("Host:", process.env.DB_HOST);
  console.log("Port:", process.env.DB_PORT);
  console.log("User:", process.env.DB_USER);
  console.log("Database:", process.env.DB_NAME);
  console.log("Password:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");
  console.log("==========================================");

  try {
    console.log("🔄 Attempting direct MySQL connection...");

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 15000,
      acquireTimeout: 15000,
      timeout: 15000,
    });

    console.log("✅ Direct MySQL connection successful!");

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Query test successful:", rows);

    await connection.end();
    console.log("✅ Connection closed successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error errno:", error.errno);
    console.error("Error syscall:", error.syscall);
  }
}

testConnection();
