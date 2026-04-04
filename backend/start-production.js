// Production startup script - sets environment variables and starts server
// Use this instead of .env file in production

// Set environment variables programmatically
process.env.NODE_ENV = "production";
process.env.PORT = "5001";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "abdulaki_abdulaki";
process.env.DB_NAME = "abdulaki_student_results";
process.env.DB_PORT = "3306";
process.env.DB_PASSWORD = "Alhamdulillaah##91";
process.env.JWT_SECRET =
  "your-super-secret-jwt-key-change-this-in-production-1774931245246";
process.env.JWT_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "https://cs-checkresult.com.abdulaki.com";
process.env.MAX_FILE_SIZE = "10485760";
process.env.UPLOAD_PATH = "./uploads";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX_REQUESTS = "100";
process.env.LOG_LEVEL = "info";

console.log("🚀 Starting server with environment variables (no .env file)");
console.log("📍 Environment:", process.env.NODE_ENV);
console.log("🌐 Client URL:", process.env.CLIENT_URL);

// Start the main server
require("./index.js");
