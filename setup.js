#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Setting up Student Result Management System...\n");

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

if (majorVersion < 16) {
  console.error("❌ Node.js version 16 or higher is required");
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log("✅ Node.js version check passed");

// Create environment files if they don't exist
const createEnvFile = (filePath, content) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filePath}`);
  } else {
    console.log(`⚠️  ${filePath} already exists, skipping...`);
  }
};

// Backend .env
const backendEnv = `NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=student_results
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
`;

// Frontend .env
const frontendEnv = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Student Result System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
`;

console.log("\n📝 Creating environment files...");
createEnvFile("backend/.env", backendEnv);
createEnvFile("frontend/.env", frontendEnv);

// Install dependencies
console.log("\n📦 Installing dependencies...");
try {
  console.log("   Installing root dependencies...");
  execSync("npm install", { stdio: "inherit" });

  console.log("   Installing backend dependencies...");
  execSync("cd backend && npm install", { stdio: "inherit" });

  console.log("   Installing frontend dependencies...");
  execSync("cd frontend && npm install", { stdio: "inherit" });

  console.log("✅ All dependencies installed successfully");
} catch (error) {
  console.error("❌ Failed to install dependencies:", error.message);
  process.exit(1);
}

// Check MongoDB connection
console.log("\n🔍 Checking MongoDB connection...");
try {
  const mongoose = require("./backend/node_modules/mongoose");

  const checkMongoDB = async () => {
    try {
      await mongoose.connect("mongodb://localhost:27017/student_results_test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });

      console.log("✅ MongoDB connection successful");
      await mongoose.connection.close();

      // Offer to seed the database
      console.log("\n🌱 Would you like to seed the database with sample data?");
      console.log("   This will create an admin user and sample students.");
      console.log("   Run: cd backend && npm run seed");
    } catch (error) {
      console.log("⚠️  MongoDB connection failed");
      console.log("   Make sure MongoDB is running on localhost:27017");
      console.log("   Or update MONGODB_URI in backend/.env");
    }
  };

  checkMongoDB();
} catch (error) {
  console.log("⚠️  Could not check MongoDB connection");
  console.log("   Make sure MongoDB is installed and running");
}

console.log("\n🎉 Setup completed successfully!");
console.log("\n📋 Next steps:");
console.log("   1. Make sure MongoDB is running");
console.log("   2. Seed the database: cd backend && npm run seed");
console.log("   3. Start the application: npm run dev");
console.log("   4. Open http://localhost:5173 in your browser");
console.log("\n🔑 Default admin credentials:");
console.log("   Username: admin");
console.log("   Password: admin123");
console.log("\n📚 For more information, see README.md");
