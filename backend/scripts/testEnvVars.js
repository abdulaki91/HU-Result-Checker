// Test environment variables without .env file
try {
  require("dotenv").config();
  console.log("📄 .env file loaded for testing");
} catch (error) {
  console.log("⚠️  No .env file found, testing environment variables only");
}

console.log("🔍 Testing Environment Variables:");
console.log("================================");

const requiredVars = [
  "NODE_ENV",
  "PORT",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "DB_PORT",
  "DB_PASSWORD",
  "JWT_SECRET",
  "CLIENT_URL",
];

let allPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  const displayValue =
    varName.includes("PASSWORD") || varName.includes("SECRET")
      ? value
        ? `[${value.length} chars]`
        : "NOT SET"
      : value || "NOT SET";

  console.log(`${status} ${varName}: ${displayValue}`);

  if (!value) {
    allPresent = false;
  }
});

console.log("\n" + "=".repeat(40));
console.log(
  allPresent
    ? "✅ All required environment variables are set!"
    : "❌ Some environment variables are missing!",
);

if (!allPresent) {
  console.log(
    "\n💡 Make sure to set these environment variables in your hosting platform:",
  );
  console.log("   - For cPanel: Use Node.js App environment variables section");
  console.log("   - For Vercel: Use Environment Variables in project settings");
  console.log("   - For Heroku: Use Config Vars in app settings");
}

process.exit(allPresent ? 0 : 1);
