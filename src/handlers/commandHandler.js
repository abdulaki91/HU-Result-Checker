const config = require("../../config");

class CommandHandler {
  constructor(bot, database, menuHandler) {
    this.bot = bot;
    this.database = database;
    this.menuHandler = menuHandler;
  }

  setupCommands() {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      await this.handleStartCommand(msg);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      await this.handleHelpCommand(msg);
    });

    // Status command (admin only)
    this.bot.onText(/\/status/, async (msg) => {
      await this.handleStatusCommand(msg);
    });

    // Refresh command
    this.bot.onText(/\/refresh/, async (msg) => {
      await this.handleRefreshCommand(msg);
    });

    // Course command (admin only)
    this.bot.onText(/\/course (.+)/, async (msg, match) => {
      await this.handleCourseCommand(msg, match[1]);
    });
  }

  async handleStartCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const welcomeMessage = `🎓 *Welcome to Student Results Bot!*

Choose an option below:`;

    const keyboard = this.menuHandler.getMainMenuKeyboard(userId);

    await this.bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  async handleHelpCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    let helpMessage = `📚 *Help & Commands*

🔍 *For Students:*
• Use "Check My Result" button or send your Student ID
• You can use full ID (GPR0015/15) or short ID (0015/15)
• Results include: Quiz, Mid, Assignment, Final, Total, Grade

📝 *Student ID Examples:*
• Full format: GPR0015/15, STU001, REG123
• Short format: 0015/15, 001, 123
• Both formats work - use whichever is easier!

📝 *Commands:*
• /start - Show main menu
• /help - Show this help message
• /refresh - Refresh menu with current stats`;

    if (userId === config.ADMIN_USER_ID) {
      helpMessage += `\n\n👑 *Admin Commands:*
• /status - Check system status and student count
• /course [Course Name] | [Instructor Name] - Update course info
• Upload Excel file - Update student database

📊 *Excel File Format:*
Flexible column names supported including:
• QUIZ(5%), MID(30%), ASSIGNMENT(15%), FINAL(50%)
• GROUP ASSIGNMENT, PROJECT (optional)
• STUDENT NAME, STUDENT ID, TOTAL, GRADE

*Course Command Example:*
\`/course Computer Science 101 | Dr. John Smith\``;
    }

    const keyboard = {
      inline_keyboard: [
        [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
      ],
    };

    await this.bot.sendMessage(chatId, helpMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  async handleStatusCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId !== config.ADMIN_USER_ID) {
      await this.bot.sendMessage(
        chatId,
        "❌ Access denied. Admin only command.",
      );
      return;
    }

    try {
      const studentCount = await this.database.getStudentCount();
      const storageType = config.USE_JSON_STORAGE ? "JSON File" : "MySQL";

      const statusMessage = `📊 *System Status*

✅ Bot is running
💾 Storage: ${storageType}
👥 Students in database: ${studentCount}

🕐 Last updated: ${new Date().toLocaleString()}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(chatId, statusMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Status command error:", error.message);
      await this.bot.sendMessage(chatId, "❌ Failed to get system status");
    }
  }

  async handleRefreshCommand(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
      const studentCount = await this.database.getStudentCount();
      const lastUpdate = new Date().toLocaleString();

      const refreshMessage = `🔄 *Menu Refreshed*

📊 *Current Stats:*
👥 Students in database: ${studentCount}
🕐 Refreshed at: ${lastUpdate}

Use the menu below to navigate:`;

      const keyboard = this.menuHandler.getMainMenuKeyboard(userId);

      await this.bot.sendMessage(chatId, refreshMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Refresh command error:", error.message);
      await this.bot.sendMessage(chatId, "❌ Failed to refresh menu");
    }
  }

  async handleCourseCommand(msg, courseInfo) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId !== config.ADMIN_USER_ID) {
      await this.bot.sendMessage(
        chatId,
        "❌ Access denied. Admin only command.",
      );
      return;
    }

    try {
      // Parse course info: "Course Name | Instructor Name"
      const parts = courseInfo.split("|").map((part) => part.trim());

      if (parts.length !== 2) {
        await this.bot.sendMessage(
          chatId,
          `❌ Invalid format. Please use:\n\`/course [Course Name] | [Instructor Name]\`\n\n*Example:*\n\`/course Computer Science 101 | Dr. John Smith\``,
          { parse_mode: "Markdown" },
        );
        return;
      }

      const [courseName, instructorName] = parts;

      if (!courseName || !instructorName) {
        await this.bot.sendMessage(
          chatId,
          "❌ Both course name and instructor name are required.",
        );
        return;
      }

      // Update course settings
      await this.database.updateCourseSettings(courseName, instructorName);

      const successMessage = `✅ *Course Settings Updated!*

📖 *Course Name:* ${courseName}
👨‍🏫 *Instructor Name:* ${instructorName}

Students will now see this information when checking their results.`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "📚 Course Settings", callback_data: "course_settings" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(chatId, successMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Course command error:", error.message);
      await this.bot.sendMessage(
        chatId,
        "❌ Failed to update course settings. Please try again.",
      );
    }
  }
}

module.exports = CommandHandler;
