const express = require("express");
const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Bot is running",
    timestamp: new Date().toISOString(),
    bot: "Student Results Bot",
  });
});

// Health check for hosting platforms
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Initialize bot
let bot;

async function initializeBot() {
  try {
    bot = new StudentResultsBot(true); // Pass true for webhook mode
    await bot.initialize();

    // Set webhook endpoint
    app.post(`/webhook/${config.BOT_TOKEN}`, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });

    Logger.info("✅ Bot initialized in webhook mode");
  } catch (error) {
    Logger.error("❌ Failed to initialize bot:", error.message);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeBot();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Received SIGINT, shutting down gracefully...");
  if (bot) await bot.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("Received SIGTERM, shutting down gracefully...");
  if (bot) await bot.shutdown();
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
