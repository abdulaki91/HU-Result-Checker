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

    // Check if admin is in reply mode
    global.adminStates = global.adminStates || {};
    if (global.adminStates[userId]?.state === "waiting_reply") {
      await this.handleAdminReplyMessage(msg);
      return;
    }

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
      // Send immediate thank you message
      const immediateMessages = [
        `🙏 Thank you, ${userName}! Processing your feedback...`,
        `💝 Thanks for your feedback, ${userName}! Saving it now...`,
        `🌟 Appreciate your input, ${userName}! One moment please...`,
        `🎉 Thank you, ${userName}! Your feedback is being processed...`,
        `💙 Thanks, ${userName}! Storing your valuable feedback...`,
      ];

      const randomImmediate =
        immediateMessages[Math.floor(Math.random() * immediateMessages.length)];
      const processingMsg = await this.bot.sendMessage(chatId, randomImmediate);

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

      // Send personalized thank you and confirmation to user
      const thankYouMessages = [
        `🙏 Thank you so much, ${userName}! Your feedback is invaluable to us.`,
        `💝 We truly appreciate your feedback, ${userName}! Thank you for helping us improve.`,
        `🌟 Thank you, ${userName}! Your input helps make our system better for everyone.`,
        `🎉 ${userName}, thank you for taking the time to share your thoughts with us!`,
        `💙 Your feedback means a lot to us, ${userName}! Thank you for your contribution.`,
      ];

      // Select a random thank you message
      const randomThankYou =
        thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

      const confirmationMessage = `✅ *Feedback Received Successfully!*

${randomThankYou}

💬 *Your feedback:*
"${text}"

📝 *What happens next:*
• Our administrators will carefully review your feedback
• If needed, they may reach out to you for follow-up
• Your valuable input helps us continuously improve the system
• We take every piece of feedback seriously

🌟 *Your voice matters!* Thank you for being an active part of our community and helping us create a better experience for all students.

🙏 We genuinely appreciate you taking the time to share your thoughts with us!`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "💬 Send More Feedback", callback_data: "feedback" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      // Replace the processing message with the full confirmation
      await this.bot.editMessageText(confirmationMessage, {
        chat_id: chatId,
        message_id: processingMsg.message_id,
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

✅ *Student has been thanked automatically*

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

  async handleAdminReplyMessage(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text?.trim();
    const config = require("../../config");

    // Verify admin
    if (userId !== config.ADMIN_USER_ID) {
      return;
    }

    try {
      // Get admin state
      global.adminStates = global.adminStates || {};
      const adminState = global.adminStates[userId];

      if (!adminState || adminState.state !== "waiting_reply") {
        return;
      }

      // Clear admin state
      delete global.adminStates[userId];

      const { feedbackId, studentUserId, studentName, originalMessage } =
        adminState;

      // Send reply to student
      const replyMessage = `💬 *Reply from Administrator*

Hello! We received your feedback and wanted to respond:

📝 *Your original message:*
"${originalMessage}"

👨‍💼 *Admin response:*
"${text}"

🙏 Thank you for your feedback! If you have any follow-up questions, feel free to send more feedback.

---
*This is an automated message from the administration.*`;

      const studentKeyboard = {
        inline_keyboard: [
          [{ text: "💬 Send More Feedback", callback_data: "feedback" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      try {
        await this.bot.sendMessage(studentUserId, replyMessage, {
          parse_mode: "Markdown",
          reply_markup: studentKeyboard,
        });

        // Mark feedback as replied
        await this.database.markFeedbackAsReplied(feedbackId);

        // Send confirmation to admin
        const confirmationMessage = `✅ *Reply Sent Successfully!*

👤 *To:* ${studentName}
💬 *Your reply:* "${text}"

The student has been notified and the feedback has been marked as replied.`;

        const adminKeyboard = {
          inline_keyboard: [
            [{ text: "💬 View All Feedback", callback_data: "view_feedback" }],
            [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
          ],
        };

        await this.bot.sendMessage(chatId, confirmationMessage, {
          parse_mode: "Markdown",
          reply_markup: adminKeyboard,
        });
      } catch (studentError) {
        console.error(
          "❌ Error sending reply to student:",
          studentError.message,
        );

        // Send error message to admin
        const errorMessage = `❌ *Failed to Send Reply*

There was an error sending your reply to the student. This could happen if:
• The student has blocked the bot
• The student's account is no longer active
• There was a network issue

💬 *Your reply was:* "${text}"

Please try contacting the student through other means if necessary.`;

        const errorKeyboard = {
          inline_keyboard: [
            [{ text: "💬 View All Feedback", callback_data: "view_feedback" }],
            [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
          ],
        };

        await this.bot.sendMessage(chatId, errorMessage, {
          parse_mode: "Markdown",
          reply_markup: errorKeyboard,
        });
      }
    } catch (error) {
      console.error("❌ Admin reply error:", error.message);

      // Clear admin state on error
      global.adminStates = global.adminStates || {};
      delete global.adminStates[userId];

      const keyboard = {
        inline_keyboard: [
          [{ text: "💬 View All Feedback", callback_data: "view_feedback" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(
        chatId,
        "❌ Sorry, there was an error processing your reply. Please try again.",
        {
          reply_markup: keyboard,
        },
      );
    }
  }
}

module.exports = MessageHandler;
