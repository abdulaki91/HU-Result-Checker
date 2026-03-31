const { testConnection } = require("./config/database");

async function test() {
  try {
    console.log("Testing database connection...");
    await testConnection();
    console.log("Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Connection test failed:", error.message);
    process.exit(1);
  }
}

test();
