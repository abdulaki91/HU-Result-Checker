const express = require("express");
const path = require("path");
const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const ErrorLogger = require("./src/utils/errorLogger");
const config = require("./config");

const app = express();
const errorLogger = new ErrorLogger();

// Log startup
errorLogger.info("Starting Telegram Student Results Bot for cPanel", {
  nodeVersion: process.version,
  platform: process.platform,
  cwd: process.cwd(),
  env: process.env.NODE_ENV,
});

// cPanel specific configuration from .env
const PORT = config.PORT;
const BASE_PATH = config.BASE_PATH;

// Middleware with error logging
app.use(
  express.json({
    limit: config.MAX_FILE_SIZE,
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (error) {
        errorLogger.error("Invalid JSON in request body", error, {
          contentType: req.get("Content-Type"),
          contentLength: req.get("Content-Length"),
        });
        throw error;
      }
    },
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: config.MAX_FILE_SIZE,
  }),
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      errorLogger.error(`HTTP ${res.statusCode} error`, null, logData);
    } else {
      errorLogger.info(`${req.method} ${req.url}`, logData);
    }
  });

  next();
});

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoints with detailed logging
app.get("/", (req, res) => {
  const response = {
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
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
    },
  };

  errorLogger.info("Root endpoint accessed", {
    userAgent: req.get("User-Agent"),
  });
  res.json(response);
});

app.get(config.HEALTH_ENDPOINT, (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: config.NODE_ENV,
    checks: {
      database: "unknown", // Will be updated by bot initialization
      bot: "unknown",
    },
  };

  errorLogger.info("Health check accessed");
  res.json(health);
});

app.get(config.STATUS_ENDPOINT, (req, res) => {
  const status = {
    bot: "Student Results Bot",
    status: bot ? "Active" : "Initializing",
    mode: "Webhook",
    timestamp: new Date().toISOString(),
    config: {
      domain: config.CPANEL_DOMAIN,
      baseUrl: config.FULL_BASE_URL,
      webhookUrl: config.FULL_WEBHOOK_URL,
      useJsonStorage: config.USE_JSON_STORAGE,
      database: config.USE_JSON_STORAGE ? "JSON File" : "MySQL",
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      pid: process.pid,
    },
  };

  errorLogger.info("Status endpoint accessed");
  res.json(status);
});

// Error logs endpoint (for debugging)
app.get("/logs/errors", async (req, res) => {
  try {
    const summary = await errorLogger.generateErrorSummary();
    res.json(summary);
  } catch (error) {
    errorLogger.error("Failed to generate error summary", error);
    res.status(500).json({ error: "Failed to generate error summary" });
  }
});

// Initialize bot
let bot;

async function initializeBot() {
  try {
    errorLogger.info("Initializing bot in webhook mode");

    bot = new StudentResultsBot(true); // Webhook mode
    await bot.initialize();

    // Webhook endpoint - using config
    app.post(config.WEBHOOK_PATH, (req, res) => {
      try {
        errorLogger.info("Webhook received", {
          updateId: req.body.update_id,
          messageType: req.body.message
            ? "message"
            : req.body.callback_query
              ? "callback_query"
              : "other",
        });

        bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        errorLogger.webhookError(req.body, error);
        res.sendStatus(500);
      }
    });

    // Alternative webhook path with token (more secure)
    app.post(`${config.WEBHOOK_PATH}/${config.BOT_TOKEN}`, (req, res) => {
      try {
        errorLogger.info("Secure webhook received", {
          updateId: req.body.update_id,
        });

        bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        errorLogger.webhookError(req.body, error);
        res.sendStatus(500);
      }
    });

    errorLogger.info("Bot initialized successfully in webhook mode", {
      webhookUrl: config.FULL_WEBHOOK_URL,
    });
  } catch (error) {
    errorLogger.startupError("bot", error);

    // Log specific cPanel issues
    if (error.message.includes("ECONNREFUSED")) {
      await errorLogger.cpanelIssue(
        "Database connection refused",
        "Cannot connect to MySQL database",
        "Check database credentials in cPanel environment variables",
      );
    }

    if (error.message.includes("MODULE_NOT_FOUND")) {
      await errorLogger.cpanelIssue(
        "Missing dependencies",
        error.message,
        'Run "npm install" in cPanel Terminal or File Manager',
      );
    }
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  errorLogger.error("Express middleware error", error, {
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers,
  });

  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
    requestId: req.headers["x-request-id"] || "unknown",
  });
});

// 404 handler
app.use((req, res) => {
  errorLogger.warn("404 Not Found", {
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: [
      "/",
      config.STATUS_ENDPOINT,
      config.HEALTH_ENDPOINT,
      config.WEBHOOK_PATH,
      "/logs/errors",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server with comprehensive error handling
const server = app.listen(PORT, async () => {
  const startupInfo = {
    port: PORT,
    baseUrl: config.FULL_BASE_URL,
    webhookUrl: config.FULL_WEBHOOK_URL,
    statusUrl: config.FULL_STATUS_URL,
    healthUrl: config.FULL_HEALTH_URL,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  console.log(`🚀 cPanel Bot Server running on port ${PORT}`);
  console.log(`📍 Base URL: ${config.FULL_BASE_URL}`);
  console.log(`🔗 Webhook URL: ${config.FULL_WEBHOOK_URL}`);
  console.log(`📊 Status URL: ${config.FULL_STATUS_URL}`);
  console.log(`❤️  Health URL: ${config.FULL_HEALTH_URL}`);
  console.log(`📄 Error Logs: ${config.FULL_BASE_URL}/logs/errors`);

  errorLogger.info("Server started successfully", startupInfo);

  await initializeBot();
});

// Server error handling
server.on("error", (error) => {
  errorLogger.startupError("server", error);

  if (error.code === "EADDRINUSE") {
    errorLogger.cpanelIssue(
      "Port already in use",
      `Port ${PORT} is already being used`,
      "Check if another instance is running or change PORT in environment variables",
    );
  }

  if (error.code === "EACCES") {
    errorLogger.cpanelIssue(
      "Permission denied",
      `Cannot bind to port ${PORT}`,
      "Check if you have permission to use this port on cPanel",
    );
  }
});

// Graceful shutdown with logging
process.on("SIGINT", async () => {
  errorLogger.info("Received SIGINT, shutting down gracefully");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  errorLogger.info("Received SIGTERM, shutting down gracefully");
  if (bot) await bot.shutdown();
  server.close();
  process.exit(0);
});

// Global error handlers
process.on("uncaughtException", (error) => {
  errorLogger.error("Uncaught Exception", error);
  console.error("Uncaught Exception:", error.message);
  console.error(error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  errorLogger.error(
    "Unhandled Rejection",
    reason instanceof Error ? reason : new Error(reason),
    {
      promise: promise.toString(),
    },
  );
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Log memory usage periodically
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 100 * 1024 * 1024) {
    // Log if using more than 100MB
    errorLogger.warn("High memory usage detected", memUsage);
  }
}, 60000); // Check every minute

module.exports = app;
