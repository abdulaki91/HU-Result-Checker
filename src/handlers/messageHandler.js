class MessageHandler {
  constructor(bot, database, excelService) {
    this.bot = bot;
    this.database = database;
    this.excelService = excelService;
  }

  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text?.trim();

    if (!text) return;

    // Check if user is in feedback mode
    global.userStates = global.userStates || {};
    if (global.userStates[userId]?.state === "waiting_feedback") {
      await this.handleFeedbackMessage(msg);
      return;
    }

    // Import validators
    const Validators = require("../utils/validators");

    // Validate student ID format before searching
    if (!Validators.isValidStudentIdForSearch(text)) {
      const formatErrorMessage = `❌ *Invalid Student ID Format*

🆔 You entered: \`${text}\`

✅ *Required Format:* \`XXXX/XX\`

📝 *Examples:*
• \`0014/14\`
• \`0025/15\`
• \`0123/20\`

⚠️ *Please enter your complete Student ID including the slash (/) and year digits.*

Try again with the correct format.`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔍 Try Again", callback_data: "check_result" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(chatId, formatErrorMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
      return;
    }

    // If format is valid, proceed with search
    await this.searchStudentResult(chatId, text);
  }

  async searchStudentResult(chatId, studentId) {
    const searchingMsg = await this.bot.sendMessage(
      chatId,
      `🔍 Searching for student ID: \`${studentId}\`...`,
      { parse_mode: "Markdown" },
    );

    try {
      const student = await this.database.findStudentById(studentId);

      if (!student) {
        const notFoundMessage = `❌ *Student not found*

🆔 Searched for: \`${studentId}\`

💡 *Please check:*
• Your Student ID is correct (format: XXXX/XX)
• Results have been uploaded by admin
• Make sure you're using the exact format: 0014/14

📝 *Required Format:* \`XXXX/XX\`
• Example: \`0014/14\`
• Example: \`0025/15\`

Need help? Contact your instructor.`;

        const keyboard = {
          inline_keyboard: [
            [{ text: "🔍 Try Again", callback_data: "check_result" }],
            [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
          ],
        };

        await this.bot.editMessageText(notFoundMessage, {
          chat_id: chatId,
          message_id: searchingMsg.message_id,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
        return;
      }

      // Format and send result
      const resultMessage = await this.excelService.formatStudentResult(
        student,
        this.database,
      );

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔍 Check Another Result", callback_data: "check_result" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(resultMessage, {
        chat_id: chatId,
        message_id: searchingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Search error:", error.message);

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔍 Try Again", callback_data: "check_result" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(
        "❌ An error occurred while searching. Please try again.",
        {
          chat_id: chatId,
          message_id: searchingMsg.message_id,
          reply_markup: keyboard,
        },
      );
    }
  }

  async handleFeedbackMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text?.trim();
    const userName = msg.from.first_name || "Unknown";
    const userUsername = msg.from.username ? `@${msg.from.username}` : "";

    try {
      // Clear user state
      global.userStates = global.userStates || {};
      delete global.userStates[userId];

      // Try to find student ID for this user (optional)
      let studentId = null;
      try {
        // This is a simple approach - in a real system you might want to
        // store user-to-student mappings more systematically
        const students = (await this.database.getAllStudents?.()) || [];
        // For now, we'll just store the feedback without linking to student ID
      } catch (error) {
        // Ignore error, feedback will be stored without student ID
      }

      // Save feedback to database
      await this.database.saveFeedback({
        user_id: userId,
        student_id: studentId,
        user_name: userName,
        user_username: userUsername,
        message: text,
        created_at: new Date(),
      });

      // Send confirmation to user
      const confirmationMessage = `✅ *Feedback Sent Successfully!*

Thank you for your feedback! Your message has been sent to the administrators.

💬 *Your feedback:*
"${text}"

📝 *What happens next:*
• Administrators will review your feedback
• If needed, they may contact you for follow-up
• Your feedback helps improve the system

🙏 We appreciate you taking the time to share your thoughts!`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "💬 Send More Feedback", callback_data: "feedback" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(chatId, confirmationMessage, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      // Notify admin if configured
      const config = require("../../config");
      if (config.ADMIN_USER_ID) {
        const adminNotification = `🔔 *New Feedback Received*

👤 *From:* ${userName} ${userUsername}
🆔 *User ID:* ${userId}
🕐 *Time:* ${new Date().toLocaleString()}

💬 *Message:*
"${text}"

📊 View all feedback: /start → View Feedback`;

        try {
          await this.bot.sendMessage(config.ADMIN_USER_ID, adminNotification, {
            parse_mode: "Markdown",
          });
        } catch (adminError) {
          console.log(
            "Could not notify admin about feedback:",
            adminError.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Feedback save error:", error.message);

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "feedback" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(
        chatId,
        "❌ Sorry, there was an error saving your feedback. Please try again.",
        {
          reply_markup: keyboard,
        },
      );
    }
  }
}

module.exports = MessageHandler;
