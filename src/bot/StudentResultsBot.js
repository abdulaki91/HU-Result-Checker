const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs").promises;
const config = require("../../config");
const { Database } = require("../../database");
const ExcelService = require("../../excelService");

// Import handlers
const MenuHandler = require("../handlers/menuHandler");
const CommandHandler = require("../handlers/commandHandler");
const FileHandler = require("../handlers/fileHandler");
const MessageHandler = require("../handlers/messageHandler");

class StudentResultsBot {
  constructor(useWebhook = false) {
    this.useWebhook = useWebhook;

    if (useWebhook) {
      // Webhook mode - no polling
      this.bot = new TelegramBot(config.BOT_TOKEN);
    } else {
      // Polling mode - for local development
      this.bot = new TelegramBot(config.BOT_TOKEN, { polling: true });
    }

    this.database = new Database();
    this.excelService = new ExcelService();

    // Initialize handlers
    this.menuHandler = new MenuHandler(
      this.bot,
      this.database,
      this.excelService,
    );
    this.commandHandler = new CommandHandler(
      this.bot,
      this.database,
      this.menuHandler,
    );
    this.fileHandler = new FileHandler(
      this.bot,
      this.database,
      this.excelService,
    );
    this.messageHandler = new MessageHandler(
      this.bot,
      this.database,
      this.excelService,
    );

    this.setupEventHandlers();
    this.setupCommands();
  }

  async initialize() {
    try {
      await this.database.initialize();
      console.log("🤖 Bot initialized successfully");

      // Create temp directory for file downloads
      await fs.mkdir("./temp", { recursive: true });

      const botInfo = await this.bot.getMe();
      console.log(`✅ Bot @${botInfo.username} is running...`);
    } catch (error) {
      console.error("❌ Failed to initialize bot:", error.message);
      process.exit(1);
    }
  }

  setupEventHandlers() {
    // Handle errors
    this.bot.on("error", (error) => {
      console.error("❌ Bot error:", error.message);
    });

    // Handle polling errors
    this.bot.on("polling_error", (error) => {
      console.error("❌ Polling error:", error.message);
    });

    // Handle document uploads
    this.bot.on("document", async (msg) => {
      await this.fileHandler.handleDocumentUpload(msg);
    });

    // Handle callback queries (button presses)
    this.bot.on("callback_query", async (query) => {
      await this.menuHandler.handleCallbackQuery(query);
    });

    // Handle text messages
    this.bot.on("message", async (msg) => {
      if (msg.document) return; // Skip document messages (handled separately)
      if (msg.text && msg.text.startsWith("/")) return; // Skip commands (handled separately)

      await this.messageHandler.handleTextMessage(msg);
    });
  }

  setupCommands() {
    this.commandHandler.setupCommands();
  }

  // Process webhook updates
  processUpdate(update) {
    this.bot.processUpdate(update);
  }

  getProcessingStatus() {
    return this.fileHandler.getProcessingStatus();
  }

  async shutdown() {
    console.log("🔄 Shutting down bot...");
    await this.database.close();

    if (!this.useWebhook) {
      await this.bot.stopPolling();
    }

    console.log("👋 Bot shutdown complete");
  }
}

module.exports = StudentResultsBot;
