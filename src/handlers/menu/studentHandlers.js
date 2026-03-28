/**
 * Student Handlers Module
 * Handles student-specific menu functionality
 */

const Logger = require("../../utils/logger");
const KeyboardBuilder = require("./keyboardBuilder");

class StudentHandlers {
  constructor(bot, database) {
    this.bot = bot;
    this.database = database;
  }

  /**
   * Handle check result callback for students
   */
  async handleCheckResultCallback(chatId, messageId) {
    try {
      // Add timestamp to make each refresh unique
      const timestamp = new Date().toLocaleTimeString();

      const message = `🔍 *Check Student Result*

Please send your Student ID in the correct format to get your results.

📝 *Required Format:*
• Student ID: \`XXXX/XX\`
• Example: \`0014/14\`
• Example: \`0025/15\`

⚠️ *Important:* You must enter your complete Student ID including the slash (/) and year digits.

Just type your Student ID in the format XXXX/XX and send it.

🕐 *Last updated:* ${timestamp}`;

      const keyboard = KeyboardBuilder.getRefreshBackKeyboard("check_result");

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
        "check_result",
        "Check result system temporarily unavailable",
      );
    }
  }

  /**
   * Handle feedback callback for students
   */
  async handleFeedbackCallback(chatId, userId, messageId) {
    try {
      // Add timestamp to make each refresh unique
      const timestamp = new Date().toLocaleTimeString();

      const message = `💬 *Send Feedback*

We value your feedback! Please share your thoughts about:

📝 *What you can feedback about:*
• Your exam results
• The bot's functionality
• Suggestions for improvement
• Any issues you encountered
• General comments

✍️ *How to send feedback:*
Just type your message and send it. Your feedback will be sent to the administrators.

💡 *Tips:*
• Be specific about any issues
• Include your Student ID if relevant
• Constructive feedback helps us improve

🕐 *Last updated:* ${timestamp}`;

      const keyboard = KeyboardBuilder.getRefreshBackKeyboard("feedback");

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      // Set user state to expect feedback
      global.userStates = global.userStates || {};
      global.userStates[userId] = {
        state: "waiting_feedback",
        chatId: chatId,
        messageId: messageId,
      };
    } catch (error) {
      await this._handleError(
        error,
        chatId,
        messageId,
        "feedback",
        "Feedback system temporarily unavailable",
      );
    }
  }

  /**
   * Handle help callback
   */
  async handleHelpCallback(chatId, userId, messageId) {
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
   * Handle back to menu callback
   */
  async handleBackToMenuCallback(chatId, userId, messageId) {
    const welcomeMessage = `🎓 *Welcome to Student Results Bot!*

Choose an option below:`;

    const keyboard = KeyboardBuilder.getMainMenuKeyboard(userId);

    await this.bot.editMessageText(welcomeMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  /**
   * Handle refresh menu callback
   */
  async handleRefreshMenuCallback(chatId, userId, messageId) {
    // Show a brief loading message
    try {
      await this.bot.answerCallbackQuery(query?.id, {
        text: "🔄 Refreshing menu...",
        show_alert: false,
      });
    } catch (error) {
      // Ignore callback query errors
    }

    // Get updated information
    let studentCount = 0;
    let lastUpdate = new Date().toLocaleString();

    try {
      studentCount = await this.database.getStudentCount();
    } catch (error) {
      Logger.warning("Failed to get student count for refresh:", error.message);
    }

    const welcomeMessage = `🎓 *Welcome to Student Results Bot!*

📊 *Quick Stats:*
👥 Students in database: ${studentCount}
🕐 Last refreshed: ${lastUpdate}

Choose an option below:`;

    const keyboard = KeyboardBuilder.getRefreshableMainMenuKeyboard(userId);

    await this.bot.editMessageText(welcomeMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  /**
   * Private method to handle errors consistently
   */
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

module.exports = StudentHandlers;
