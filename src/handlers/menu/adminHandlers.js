/**
 * Admin Handlers Module
 * Handles admin-specific menu functionality
 */

const config = require("../../../config");
const Logger = require("../../utils/logger");
const KeyboardBuilder = require("./keyboardBuilder");

class AdminHandlers {
  constructor(bot, database) {
    this.bot = bot;
    this.database = database;
  }

  /**
   * Check if user is admin
   */
  _isAdmin(userId) {
    return userId === config.ADMIN_USER_ID;
  }

  /**
   * Handle access denied for non-admin users
   */
  async _handleAccessDenied(chatId, messageId) {
    const keyboard = KeyboardBuilder.getBackToMenuKeyboard();

    await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
    });
  }

  /**
   * Handle upload Excel callback
   */
  async handleUploadExcelCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      // Add timestamp to make each refresh unique
      const timestamp = new Date().toLocaleTimeString();

      const message = `📊 *Upload Excel File*

Please upload your Excel file (.xlsx or .xls) with student data.

📋 *Required Columns (only these are mandatory):*
• Student Name (or NAME, FULL NAME, STUDENT)
• Student ID (or ID, REG NO, STUDENT NO)

📋 *Optional Columns (will use defaults if missing):*
• Quiz (default: 0)
• Mid (default: 0)
• Assignment (default: 0)
• Group Assignment (default: null, optional)
• Project (default: null, optional)
• Final (default: 0)
• Total (default: 0)
• Grade (default: "--", accepts any text including "--", "N/A", etc.)

💡 *Tip:* Column names are flexible - the bot will automatically detect variations.

Just drag and drop your Excel file here!

🕐 *Last updated:* ${timestamp}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh Instructions", callback_data: "upload_excel" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      await this._handleError(
        error,
        chatId,
        messageId,
        "upload_excel",
        "Upload system temporarily unavailable",
      );
    }
  }

  /**
   * Handle system status callback
   */
  async handleSystemStatusCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      Logger.info("Getting system status...");

      let studentCount = 0;
      let countError = null;

      try {
        studentCount = await this.database.getStudentCount();
        Logger.info(`Retrieved student count: ${studentCount}`);
      } catch (error) {
        Logger.error("Failed to get student count:", error.message);
        countError = error.message;
        studentCount = "Error";
      }

      const storageType = config.USE_JSON_STORAGE ? "JSON File" : "MySQL";

      let statusMessage = `📊 *System Status*

✅ Bot is running
💾 Storage: ${storageType}
👥 Students in database: ${studentCount}`;

      if (countError) {
        statusMessage += `\n⚠️ *Count Error:* ${countError}`;
      }

      statusMessage += `\n\n🕐 Last updated: ${new Date().toLocaleString()}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh", callback_data: "system_status" }],
          [{ text: "🗑️ Clear All Data", callback_data: "clear_all_data" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(statusMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      Logger.error("System status error:", error.message);

      const keyboard = KeyboardBuilder.getBackToMenuKeyboard();

      await this.bot.editMessageText("❌ Failed to get system status", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

  /**
   * Handle help callback for admin (includes admin features)
   */
  async handleAdminHelpCallback(chatId, userId, messageId) {
    try {
      // Add timestamp to make each refresh unique
      const timestamp = new Date().toLocaleTimeString();

      let helpMessage = `📚 *Help & Commands*

🔍 *For Students:*
• Use "Check My Result" button
• Send your Student ID in the correct format (XXXX/XX)
• Example: 0014/14, 0025/15
• Results include: Quiz, Mid, Assignment, Final, Total, Grade

💬 *Feedback:*
• Use "Send Feedback" button to share your thoughts
• Report issues or suggest improvements
• Your feedback helps us improve the system

📝 *Available Commands:*
• /start - Show main menu
• /help - Show this help message`;

      // Add admin features
      helpMessage += `\n\n👑 *Admin Features:*
• Upload Excel files to update student database
• Check system status and student count
• View and manage student feedback
• All admin functions available through menu buttons

📊 *Supported Excel Formats:*
The bot supports flexible column names including:
• QUIZ(5%), MID(30%), ASSIGNMENT(15%), FINAL(50%)
• STUDENT NAME, STUDENT ID, TOTAL, GRADE
• And many other variations`;

      // Add timestamp to make content unique for refresh
      helpMessage += `\n\n🕐 *Last updated:* ${timestamp}`;

      const keyboard = KeyboardBuilder.getRefreshBackKeyboard("help");

      await this.bot.editMessageText(helpMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      await this._handleError(
        error,
        chatId,
        messageId,
        "help",
        "Help system temporarily unavailable",
      );
    }
  }

  /**
   * Handle clear all data callback
   */
  async handleClearAllDataCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      const confirmMessage = `⚠️ *Clear All Student Data*

🚨 **WARNING:** This action will permanently delete ALL student records from the database.

This action cannot be undone!

Are you sure you want to proceed?`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: "✅ Yes, Clear All", callback_data: "confirm_clear_all" },
            { text: "❌ Cancel", callback_data: "system_status" },
          ],
        ],
      };

      await this.bot.editMessageText(confirmMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      await this._handleError(
        error,
        chatId,
        messageId,
        "clear_all_data",
        "Clear data system temporarily unavailable",
      );
    }
  }

  /**
   * Handle confirm clear all data callback
   */
  async handleConfirmClearAllCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      // Show processing message
      await this.bot.editMessageText("🗑️ Clearing all student data...", {
        chat_id: chatId,
        message_id: messageId,
      });

      // Clear the data
      await this.database.clearAllStudents();

      const successMessage = `✅ *All Data Cleared Successfully*

🗑️ All student records have been permanently deleted from the database.

You can now upload new Excel files to populate the database with fresh data.`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "📊 Upload Excel File", callback_data: "upload_excel" }],
          [{ text: "📈 System Status", callback_data: "system_status" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(successMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      Logger.error("Clear all data error:", error.message);

      const errorMessage = `❌ *Failed to Clear Data*

Error: ${error.message}

Please try again or contact support.`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "clear_all_data" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(errorMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    }
  }
  async _handleError(error, chatId, messageId, callbackData, fallbackMessage) {
    // Handle "message is not modified" error gracefully
    if (error.message.includes("message is not modified")) {
      Logger.info(`${callbackData} message content unchanged, skipping update`);
      return;
    }

    Logger.error(`${callbackData} callback error:`, error.message);

    // Fallback message
    const keyboard = {
      inline_keyboard: [
        [{ text: "🔄 Try Again", callback_data: callbackData }],
        [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
      ],
    };

    try {
      await this.bot.editMessageText(
        `⚠️ *Error occurred*\n\n${fallbackMessage}. Please try again.`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        },
      );
    } catch (fallbackError) {
      Logger.error(
        `Fallback ${callbackData} message failed:`,
        fallbackError.message,
      );
      // Last resort: send new message
      await this.bot.sendMessage(
        chatId,
        `❌ ${fallbackMessage}. Please try /start`,
      );
    }
  }
}

module.exports = AdminHandlers;
