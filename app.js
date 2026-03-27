const express = require("express");
const path = require("path");
const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const config = require("./config");

const app = express();

// cPanel specific configuration from .env
const PORT = config.PORT;
const BASE_PATH = config.BASE_PATH;

// Middleware
app.use(express.json({ limit: config.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true, limit: config.MAX_FILE_SIZE }));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: "Telegram Student Results Bot is running on cPanel",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: "cPanel Shared Hosting",
    urls: {
      base: config.FULL_BASE_URL,
      webhook: config.FULL_WEBHOOK_URL,
      status: config.FULL_STATUS_URL,
      health: config.FULL_HEALTH_URL,
    },
  });
});

app.get(config.HEALTH_ENDPOINT, (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV,
  });
});

app.get(config.STATUS_ENDPOINT, (req, res) => {
  res.json({
    bot: "Student Results Bot",
    status: "Active",
    mode: "Webhook",
    timestamp: new Date().toISOString(),
    config: {
      domain: config.CPANEL_DOMAIN,
      baseUrl: config.FULL_BASE_URL,
      webhookUrl: config.FULL_WEBHOOK_URL,
      useJsonStorage: config.USE_JSON_STORAGE,
      database: config.USE_JSON_STORAGE ? "JSON File" : "MySQL",
    },
  });
});

// Initialize bot
let bot;

// Register webhook routes IMMEDIATELY (before bot initialization)
// This ensures webhook endpoint exists even if bot initialization fails
app.post(config.WEBHOOK_PATH, (req, res) => {
  try {
    if (bot && bot.processUpdate) {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } else {
      console.log("⚠️ Webhook received but bot not ready yet");
      res.sendStatus(503); // Service Unavailable
    }
  } catch (error) {
    Logger.error("Webhook processing error:", error.message);
    res.sendStatus(500);
  }
});

// Alternative webhook path with token (more secure)
app.post(`${config.WEBHOOK_PATH}/${config.BOT_TOKEN}`, (req, res) => {
  try {
    if (bot && bot.processUpdate) {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } else {
      console.log("⚠️ Webhook received but bot not ready yet");
      res.sendStatus(503); // Service Unavailable
    }
  } catch (error) {
    Logger.error("Webhook processing error:", error.message);
    res.sendStatus(500);
  }
});

async function initializeBot() {
  try {
    bot = new StudentResultsBot(true); // Webhook mode
    await bot.initialize();

    Logger.info("✅ Bot initialized in webhook mode for cPanel");
    Logger.info(`📍 Webhook URL: ${config.FULL_WEBHOOK_URL}`);
  } catch (error) {
    Logger.error("❌ Failed to initialize bot:", error.message);
    // Don't exit - keep server running so webhook endpoint remains available
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  Logger.error("Express error:", error.message);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "/",
      config.STATUS_ENDPOINT,
      config.HEALTH_ENDPOINT,
      config.WEBHOOK_PATH,
    ],
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 cPanel Bot Server running on port ${PORT}`);
  console.log(`📍 Base URL: ${config.FULL_BASE_URL}`);
  console.log(`🔗 Webhook URL: ${config.FULL_WEBHOOK_URL}`);
  console.log(`📊 Status URL: ${config.FULL_STATUS_URL}`);
  console.log(`❤️  Health URL: ${config.FULL_HEALTH_URL}`);
  await initializeBot();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Received SIGINT, shutting down gracefully...");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("Received SIGTERM, shutting down gracefully...");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception:", error.message);
  Logger.error(error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

module.exports = app;
