const express = require("express");
const path = require("path");
const logger = require("./simple-logger");
const config = require("./config");

const app = express();

// Log startup
logger.startup("Starting Telegram Student Results Bot for cPanel", {
  nodeVersion: process.version,
  platform: process.platform,
  cwd: process.cwd(),
});

const PORT = config.PORT;

// Middleware with error logging
app.use(
  express.json({
    limit: config.MAX_FILE_SIZE || "50mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: config.MAX_FILE_SIZE || "50mb",
  }),
);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.error(`HTTP ${res.statusCode} error`, null, logData);
    } else {
      logger.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
    }
  });

  next();
});

// Health check endpoints
app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");

  res.json({
    status: "Telegram Student Results Bot is running on cPanel",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: "cPanel Shared Hosting",
    urls: {
      base: config.FULL_BASE_URL || `http://checkresultbot.abdiko.com`,
      webhook:
        config.FULL_WEBHOOK_URL || `http://checkresultbot.abdiko.com/webhook`,
      status:
        config.FULL_STATUS_URL || `http://checkresultbot.abdiko.com/status`,
      health:
        config.FULL_HEALTH_URL || `http://checkresultbot.abdiko.com/health`,
    },
  });
});

app.get("/health", (req, res) => {
  logger.info("Health check accessed");

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV || process.env.NODE_ENV,
  });
});

app.get("/status", (req, res) => {
  logger.info("Status endpoint accessed");

  res.json({
    bot: "Student Results Bot",
    status: "Active",
    mode: "Webhook",
    timestamp: new Date().toISOString(),
    config: {
      domain: config.CPANEL_DOMAIN || process.env.CPANEL_DOMAIN,
      baseUrl: config.FULL_BASE_URL || `http://checkresultbot.abdiko.com`,
      webhookUrl:
        config.FULL_WEBHOOK_URL || `http://checkresultbot.abdiko.com/webhook`,
      useJsonStorage: config.USE_JSON_STORAGE || false,
      database: config.USE_JSON_STORAGE ? "JSON File" : "MySQL",
    },
  });
});

// Logs endpoint
app.get("/logs", (req, res) => {
  logger.info("Logs endpoint accessed");

  try {
    const fs = require("fs");
    const logs = {};

    ["errors.log", "app.log", "cpanel-issues.log"].forEach((file) => {
      const filePath = `./logs/${file}`;
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n").filter((line) => line.trim());
        logs[file] = {
          lineCount: lines.length,
          lastLines: lines.slice(-10), // Last 10 lines
          size: fs.statSync(filePath).size,
        };
      } else {
        logs[file] = { error: "File not found" };
      }
    });

    res.json({
      timestamp: new Date().toISOString(),
      logs: logs,
    });
  } catch (error) {
    logger.error("Failed to read logs", error);
    res.status(500).json({ error: "Failed to read logs" });
  }
});

// Initialize bot
let bot;

async function initializeBot() {
  try {
    logger.info("Initializing bot in webhook mode");

    const StudentResultsBot = require("./src/bot/StudentResultsBot");
    bot = new StudentResultsBot(true); // Webhook mode
    await bot.initialize();

    // Webhook endpoint
    app.post("/webhook", (req, res) => {
      try {
        logger.info("Webhook received", {
          updateId: req.body.update_id,
          hasMessage: !!req.body.message,
          hasCallback: !!req.body.callback_query,
        });

        bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        logger.botError("webhook processing", error, req.body);
        res.sendStatus(500);
      }
    });

    logger.info("Bot initialized successfully in webhook mode");
  } catch (error) {
    logger.error("Failed to initialize bot", error);

    // Log specific issues
    if (error.message.includes("ECONNREFUSED")) {
      logger.cpanelIssue(
        "Database connection refused - check DB credentials in cPanel environment variables",
      );
    }

    if (error.message.includes("MODULE_NOT_FOUND")) {
      logger.cpanelIssue(
        `Missing module: ${error.message} - run "npm install" in cPanel Terminal`,
      );
    }

    if (error.message.includes("Cannot find module")) {
      logger.cpanelIssue(
        "Missing dependencies - upload all files and run npm install",
      );
    }
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error("Express middleware error", error, {
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn("404 Not Found", { url: req.url, method: req.method });

  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: ["/", "/status", "/health", "/webhook", "/logs"],
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, async () => {
  const startupInfo = {
    port: PORT,
    baseUrl: `http://checkresultbot.abdiko.com`,
    webhookUrl: `http://checkresultbot.abdiko.com/webhook`,
    statusUrl: `http://checkresultbot.abdiko.com/status`,
    healthUrl: `http://checkresultbot.abdiko.com/health`,
    logsUrl: `http://checkresultbot.abdiko.com/logs`,
  };

  console.log(`🚀 cPanel Bot Server running on port ${PORT}`);
  console.log(`📍 Base URL: ${startupInfo.baseUrl}`);
  console.log(`🔗 Webhook URL: ${startupInfo.webhookUrl}`);
  console.log(`📊 Status URL: ${startupInfo.statusUrl}`);
  console.log(`❤️  Health URL: ${startupInfo.healthUrl}`);
  console.log(`📄 Logs URL: ${startupInfo.logsUrl}`);

  logger.startup("Server started successfully", startupInfo);

  await initializeBot();
});

// Server error handling
server.on("error", (error) => {
  logger.error("Server startup error", error);

  if (error.code === "EADDRINUSE") {
    logger.cpanelIssue(
      `Port ${PORT} already in use - check if another instance is running`,
    );
  }

  if (error.code === "EACCES") {
    logger.cpanelIssue(
      `Permission denied for port ${PORT} - check cPanel port configuration`,
    );
  }
});

// Global error handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  console.error("Uncaught Exception:", error.message);
});

process.on("unhandledRejection", (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(reason);
  logger.error("Unhandled Rejection", error, { promise: promise.toString() });
  console.error("Unhandled Rejection:", reason);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down gracefully");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

module.exports = app;
