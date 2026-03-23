#!/usr/bin/env node

/**
 * cPanel Deployment Script for Telegram Student Results Bot
 *
 * This script helps automate the deployment process for cPanel hosting
 */

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

class CPanelDeployer {
  constructor() {
    this.steps = [
      "checkEnvironment",
      "validateConfig",
      "setupDirectories",
      "installDependencies",
      "setupDatabase",
      "setupWebhook",
      "testDeployment",
    ];
    this.currentStep = 0;
  }

  async deploy() {
    console.log(
      "🚀 Starting cPanel deployment for Telegram Student Results Bot\n",
    );

    try {
      for (const step of this.steps) {
        this.currentStep++;
        console.log(
          `📋 Step ${this.currentStep}/${this.steps.length}: ${step}`,
        );
        await this[step]();
        console.log(`✅ ${step} completed\n`);
      }

      console.log("🎉 Deployment completed successfully!");
      this.printSuccessMessage();
    } catch (error) {
      console.error(
        `❌ Deployment failed at step: ${this.steps[this.currentStep - 1]}`,
      );
      console.error(`Error: ${error.message}\n`);
      this.printTroubleshootingTips();
      process.exit(1);
    }
  }

  async checkEnvironment() {
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);

    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
    if (majorVersion < 14) {
      throw new Error("Node.js version 14 or higher is required");
    }

    // Check if we're in the right directory
    const packageJsonExists = await fs
      .access("package.json")
      .then(() => true)
      .catch(() => false);
    if (!packageJsonExists) {
      throw new Error(
        "package.json not found. Please run this script from the bot directory.",
      );
    }

    // Check if main files exist
    const requiredFiles = [
      "app.js",
      "config.js",
      "database.js",
      "src/bot/StudentResultsBot.js",
    ];
    for (const file of requiredFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    console.log("   ✅ Environment check passed");
  }

  async validateConfig() {
    // Check if .env file exists
    const envExists = await fs
      .access(".env")
      .then(() => true)
      .catch(() => false);

    if (!envExists) {
      console.log("   ⚠️  .env file not found");

      // Check if .env.cpanel.example exists
      const exampleExists = await fs
        .access(".env.cpanel.example")
        .then(() => true)
        .catch(() => false);
      if (exampleExists) {
        console.log(
          "   📋 Found .env.cpanel.example - please copy and configure it as .env",
        );
        console.log("   Command: cp .env.cpanel.example .env");
      }

      throw new Error(
        ".env file is required. Please create it with your configuration.",
      );
    }

    // Load and validate environment variables
    require("dotenv").config();

    const requiredVars = ["BOT_TOKEN", "ADMIN_USER_ID"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }

    // Validate bot token format
    if (!process.env.BOT_TOKEN.match(/^\d+:[A-Za-z0-9_-]+$/)) {
      throw new Error("BOT_TOKEN format is invalid");
    }

    // Validate admin user ID
    if (isNaN(parseInt(process.env.ADMIN_USER_ID))) {
      throw new Error("ADMIN_USER_ID must be a number");
    }

    console.log("   ✅ Configuration validation passed");
  }

  async setupDirectories() {
    const directories = ["temp", "data", "logs"];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`   📁 Created directory: ${dir}`);
      } catch (error) {
        if (error.code !== "EEXIST") {
          throw error;
        }
        console.log(`   📁 Directory exists: ${dir}`);
      }
    }

    // Set proper permissions (if on Unix-like system)
    if (process.platform !== "win32") {
      try {
        execSync("chmod 755 temp data logs", { stdio: "ignore" });
        console.log("   🔒 Set directory permissions");
      } catch (error) {
        console.log(
          "   ⚠️  Could not set directory permissions (may not be needed)",
        );
      }
    }
  }

  async installDependencies() {
    console.log("   📦 Installing Node.js dependencies...");

    try {
      // Check if node_modules exists
      const nodeModulesExists = await fs
        .access("node_modules")
        .then(() => true)
        .catch(() => false);

      if (!nodeModulesExists) {
        console.log("   📥 Running npm install...");
        execSync("npm install --production", { stdio: "inherit" });
      } else {
        console.log("   📥 Running npm ci for clean install...");
        execSync("npm ci --production", { stdio: "inherit" });
      }

      console.log("   ✅ Dependencies installed successfully");
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async setupDatabase() {
    console.log("   🗄️  Setting up database...");

    // Check if using JSON storage
    if (process.env.USE_JSON_STORAGE === "true") {
      console.log("   📄 Using JSON storage - creating data file...");

      const dataDir = path.dirname(
        process.env.JSON_FILE_PATH || "./data/students.json",
      );
      await fs.mkdir(dataDir, { recursive: true });

      const dataFile = process.env.JSON_FILE_PATH || "./data/students.json";
      const dataExists = await fs
        .access(dataFile)
        .then(() => true)
        .catch(() => false);

      if (!dataExists) {
        await fs.writeFile(dataFile, JSON.stringify([], null, 2));
        console.log(`   📄 Created JSON data file: ${dataFile}`);
      }
    } else {
      console.log("   🗄️  Setting up MySQL database...");

      try {
        execSync("node setup-database.js", { stdio: "inherit" });
        console.log("   ✅ Database setup completed");
      } catch (error) {
        throw new Error(`Database setup failed: ${error.message}`);
      }
    }
  }

  async setupWebhook() {
    console.log("   🔗 Setting up webhook...");

    if (!process.env.CPANEL_DOMAIN) {
      console.log("   ⚠️  CPANEL_DOMAIN not set - skipping webhook setup");
      console.log(
        "   💡 You can set it up later with: CPANEL_DOMAIN=yourdomain.com node setup-webhook-cpanel.js",
      );
      return;
    }

    try {
      execSync("node setup-webhook-cpanel.js", { stdio: "inherit" });
      console.log("   ✅ Webhook setup completed");
    } catch (error) {
      console.log(
        "   ⚠️  Webhook setup failed - you can set it up manually later",
      );
      console.log(`   Error: ${error.message}`);
    }
  }

  async testDeployment() {
    console.log("   🧪 Testing deployment...");

    // Test if the bot can be imported
    try {
      const StudentResultsBot = require("./src/bot/StudentResultsBot");
      console.log("   ✅ Bot class can be imported");
    } catch (error) {
      throw new Error(`Bot import failed: ${error.message}`);
    }

    // Test database connection
    try {
      const { Database } = require("./database");
      const db = new Database();
      await db.initialize();
      await db.close();
      console.log("   ✅ Database connection test passed");
    } catch (error) {
      if (process.env.USE_JSON_STORAGE !== "true") {
        throw new Error(`Database connection failed: ${error.message}`);
      }
      console.log("   ⚠️  Database test skipped (using JSON storage)");
    }

    // Test config loading
    try {
      const config = require("./config");
      if (!config.BOT_TOKEN || !config.ADMIN_USER_ID) {
        throw new Error("Configuration validation failed");
      }
      console.log("   ✅ Configuration test passed");
    } catch (error) {
      throw new Error(`Configuration test failed: ${error.message}`);
    }
  }

  printSuccessMessage() {
    console.log("\n🎉 cPanel Deployment Completed Successfully!\n");
    console.log("📋 Next Steps:");
    console.log(
      "1. Upload all files to your cPanel public_html/telegram-bot/ directory",
    );
    console.log("2. Set up Node.js app in cPanel with app.js as startup file");
    console.log("3. Add environment variables in cPanel Node.js app settings");
    console.log("4. Start your Node.js app in cPanel");
    console.log("5. Test your bot by sending /start on Telegram\n");

    console.log("🔗 Useful URLs:");
    if (process.env.CPANEL_DOMAIN) {
      console.log(
        `   Bot Status: https://${process.env.CPANEL_DOMAIN}${process.env.BOT_PATH || "/telegram-bot"}/status`,
      );
      console.log(
        `   Health Check: https://${process.env.CPANEL_DOMAIN}${process.env.BOT_PATH || "/telegram-bot"}/health`,
      );
    } else {
      console.log("   Set CPANEL_DOMAIN to see your bot URLs");
    }

    console.log("\n📚 Documentation:");
    console.log("   - CPANEL_DEPLOYMENT.md - Complete deployment guide");
    console.log("   - CPANEL_QUICK_SETUP.md - Quick setup instructions");
    console.log("   - TROUBLESHOOTING.md - Common issues and solutions\n");
  }

  printTroubleshootingTips() {
    console.log("\n🔧 Troubleshooting Tips:\n");
    console.log("1. Check Node.js version: node --version (requires 14+)");
    console.log("2. Verify .env file exists and has correct values");
    console.log("3. Ensure database credentials are correct for cPanel");
    console.log("4. Check if your domain has SSL certificate (HTTPS required)");
    console.log("5. Verify cPanel Node.js app is configured correctly");
    console.log("6. Check cPanel error logs for detailed error messages\n");
    console.log("📚 For detailed help, see TROUBLESHOOTING.md\n");
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new CPanelDeployer();
  deployer.deploy().catch(console.error);
}

module.exports = CPanelDeployer;
