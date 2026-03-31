const fs = require("fs");
const path = require("path");

console.log("🚀 cPanel Deployment Preparation");
console.log("================================");

// Check if .env.production exists
if (!fs.existsSync(".env.production")) {
  console.error("❌ .env.production file not found!");
  console.log(
    "💡 Please create .env.production with your cPanel MySQL credentials",
  );
  process.exit(1);
}

// Copy .env.production to .env for production
try {
  fs.copyFileSync(".env.production", ".env");
  console.log("✅ Copied .env.production to .env");
} catch (error) {
  console.error("❌ Failed to copy environment file:", error.message);
  process.exit(1);
}

// Create deployment checklist
const checklist = `
📋 cPanel Deployment Checklist:

Backend Deployment:
□ 1. Create MySQL database in cPanel
□ 2. Create MySQL user in cPanel  
□ 3. Add user to database with ALL PRIVILEGES
□ 4. Update .env.production with correct credentials
□ 5. Upload backend files to server
□ 6. Run: npm install --production
□ 7. Test database connection
□ 8. Start Node.js application

Frontend Deployment:
□ 1. Update VITE_API_URL in frontend/.env
□ 2. Run: npm run build
□ 3. Upload dist/ folder contents to public_html
□ 4. Configure domain to point to frontend

Database Credentials Format:
- DB_HOST: localhost (or abdulaki.com)
- DB_USER: abdulaki_student_admin
- DB_NAME: abdulaki_student_results
- DB_PASSWORD: "Alhamdulillaah##91"

Next Steps:
1. Follow CPANEL_MYSQL_SETUP.md guide
2. Update credentials in .env.production
3. Test locally with production credentials
4. Deploy to cPanel hosting
`;

console.log(checklist);

// Check Node.js version compatibility
const nodeVersion = process.version;
console.log(`📦 Current Node.js version: ${nodeVersion}`);
console.log("💡 Ensure your cPanel hosting supports this Node.js version");

console.log("\n🎯 Ready for cPanel deployment!");
console.log("📖 Follow the CPANEL_MYSQL_SETUP.md guide for detailed steps");
