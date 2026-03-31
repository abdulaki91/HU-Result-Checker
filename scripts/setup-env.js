const fs = require("fs");
const path = require("path");

console.log("🔧 Environment Setup Script");
console.log("============================");

// Check if .env files exist
const backendEnvPath = path.join("backend", ".env");
const frontendEnvPath = path.join("frontend", ".env");

const backendExamplePath = path.join("backend", ".env.example");
const frontendExamplePath = path.join("frontend", ".env.example");

// Create backend .env if it doesn't exist
if (!fs.existsSync(backendEnvPath)) {
  if (fs.existsSync(backendExamplePath)) {
    fs.copyFileSync(backendExamplePath, backendEnvPath);
    console.log("✅ Created backend/.env from .env.example");
  } else {
    console.log("❌ backend/.env.example not found");
  }
} else {
  console.log("ℹ️  backend/.env already exists");
}

// Create frontend .env if it doesn't exist
if (!fs.existsSync(frontendEnvPath)) {
  if (fs.existsSync(frontendExamplePath)) {
    fs.copyFileSync(frontendExamplePath, frontendEnvPath);
    console.log("✅ Created frontend/.env from .env.example");
  } else {
    console.log("❌ frontend/.env.example not found");
  }
} else {
  console.log("ℹ️  frontend/.env already exists");
}

console.log("\n📝 Next Steps:");
console.log("1. Edit backend/.env with your database credentials");
console.log("2. Edit frontend/.env with your API URL");
console.log("3. Never commit .env files to git");
console.log("\n🔒 Security Note:");
console.log("- .env files contain sensitive information");
console.log("- They are now properly ignored by git");
console.log("- Use .env.example as templates for new environments");
