const StudentResultsBot = require("./src/bot/StudentResultsBot");
const Logger = require("./src/utils/logger");

// Initialize and start the bot
const bot = new StudentResultsBot();

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Received SIGINT, shutting down gracefully...");
  await bot.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("Received SIGTERM, shutting down gracefully...");
  await bot.shutdown();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception:", error.message);
  Logger.error(error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the bot
bot.initialize().catch((error) => {
  Logger.error("Failed to start bot:", error.message);
  process.exit(1);
});

module.exports = StudentResultsBot;
