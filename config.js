require("dotenv").config();

const config = {
  // Bot Configuration
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_USER_ID: parseInt(process.env.ADMIN_USER_ID),

  // Database Configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT) || 3306,
  DB_NAME: process.env.DB_NAME || "student_results",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",

  // Storage Configuration
  USE_JSON_STORAGE: process.env.USE_JSON_STORAGE === "true",
  JSON_FILE_PATH: process.env.JSON_FILE_PATH || "./data/students.json",

  // cPanel Hosting Configuration
  BOT_BASE_URL: process.env.BOT_BASE_URL || "",
  CPANEL_DOMAIN: process.env.CPANEL_DOMAIN || "",
  PROTOCOL: process.env.PROTOCOL || "https",
  BOT_PATH: process.env.BOT_PATH || "",
  BASE_PATH: process.env.BASE_PATH || "",
  PORT: process.env.PORT || 3000,

  // Webhook Configuration
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || "/webhook",
  WEBHOOK_URL: process.env.WEBHOOK_URL || "",
  STATUS_ENDPOINT: process.env.STATUS_ENDPOINT || "/status",
  HEALTH_ENDPOINT: process.env.HEALTH_ENDPOINT || "/health",

  // File and Processing Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "50mb",
  TEMP_DIR: process.env.TEMP_DIR || "./temp",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
  MAX_CONCURRENT_UPLOADS: parseInt(process.env.MAX_CONCURRENT_UPLOADS) || 3,

  // Environment Detection
  IS_CPANEL: process.env.NODE_ENV === "production" || process.env.CPANEL_DOMAIN,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Auto-generate URLs if not provided
  get FULL_WEBHOOK_URL() {
    if (this.WEBHOOK_URL) return this.WEBHOOK_URL;
    if (this.BOT_BASE_URL) return `${this.BOT_BASE_URL}${this.WEBHOOK_PATH}`;
    if (this.CPANEL_DOMAIN)
      return `${this.PROTOCOL}://${this.CPANEL_DOMAIN}${this.BOT_PATH}${this.WEBHOOK_PATH}`;
    return "";
  },

  get FULL_STATUS_URL() {
    if (this.BOT_BASE_URL) return `${this.BOT_BASE_URL}${this.STATUS_ENDPOINT}`;
    if (this.CPANEL_DOMAIN)
      return `${this.PROTOCOL}://${this.CPANEL_DOMAIN}${this.BOT_PATH}${this.STATUS_ENDPOINT}`;
    return "";
  },

  get FULL_HEALTH_URL() {
    if (this.BOT_BASE_URL) return `${this.BOT_BASE_URL}${this.HEALTH_ENDPOINT}`;
    if (this.CPANEL_DOMAIN)
      return `${this.PROTOCOL}://${this.CPANEL_DOMAIN}${this.BOT_PATH}${this.HEALTH_ENDPOINT}`;
    return "";
  },

  get FULL_BASE_URL() {
    if (this.BOT_BASE_URL) return this.BOT_BASE_URL;
    if (this.CPANEL_DOMAIN)
      return `${this.PROTOCOL}://${this.CPANEL_DOMAIN}${this.BOT_PATH}`;
    return "";
  },
};

// Validate required environment variables
if (!config.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is required in .env file");
  if (!config.IS_CPANEL) process.exit(1);
}

if (!config.ADMIN_USER_ID) {
  console.error("❌ ADMIN_USER_ID is required in .env file");
  if (!config.IS_CPANEL) process.exit(1);
}

// cPanel specific validations
if (config.IS_CPANEL && !config.CPANEL_DOMAIN && !config.BOT_BASE_URL) {
  console.warn(
    "⚠️  CPANEL_DOMAIN or BOT_BASE_URL not set - webhook setup may fail",
  );
}

// Log configuration in development
if (config.NODE_ENV !== "production") {
  console.log("🔧 Bot Configuration:");
  console.log(`   Base URL: ${config.FULL_BASE_URL}`);
  console.log(`   Webhook URL: ${config.FULL_WEBHOOK_URL}`);
  console.log(`   Status URL: ${config.FULL_STATUS_URL}`);
  console.log(`   Health URL: ${config.FULL_HEALTH_URL}`);
}

module.exports = config;
