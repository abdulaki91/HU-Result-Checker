/**
 * Feedback Handlers Module
 * Handles feedback management functionality
 */

const config = require("../../../config");
const Logger = require("../../utils/logger");
const KeyboardBuilder = require("./keyboardBuilder");

class FeedbackHandlers {
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
   * Handle view feedback callback (admin only)
   */
  async handleViewFeedbackCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      const feedbackList = await this.database.getRecentFeedback(10);
      const timestamp = new Date().toLocaleTimeString();

      let message = `💬 *Student Feedback Management*\n\n`;

      if (feedbackList.length === 0) {
        message += `📭 *No feedback received yet*\n\nStudents can send feedback using the "💬 Send Feedback" button in their menu.`;

        const keyboard =
          KeyboardBuilder.getRefreshBackKeyboard("view_feedback");

        await this.bot.editMessageText(
          message + `\n\n🕐 *Last updated:* ${timestamp}`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: keyboard,
          },
        );
        return;
      }

      message += `📊 *Recent Feedback (${feedbackList.length} entries):*\n\n`;
      message += `Click on any feedback to view details and reply options.\n\n`;

      // Create buttons for each feedback
      const keyboard = { inline_keyboard: [] };

      feedbackList.forEach((feedback, index) => {
        const date = new Date(feedback.created_at).toLocaleDateString();
        const studentInfo = feedback.student_id
          ? `${feedback.student_id}`
          : `User ${feedback.user_id}`;
        const shortMessage =
          feedback.message.length > 30
            ? feedback.message.substring(0, 30) + "..."
            : feedback.message;

        keyboard.inline_keyboard.push([
          {
            text: `${index + 1}. ${studentInfo} - "${shortMessage}"`,
            callback_data: `view_feedback_detail:${feedback.id}`,
          },
        ]);
      });

      // Add control buttons
      keyboard.inline_keyboard.push([
        { text: "🔄 Refresh", callback_data: "view_feedback" },
        { text: "🔙 Back to Menu", callback_data: "back_to_menu" },
      ]);

      message += `🕐 *Last updated:* ${timestamp}`;

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
        "view_feedback",
        "Failed to load feedback",
      );
    }
  }

  /**
   * Handle view feedback detail callback
   */
  async handleViewFeedbackDetailCallback(query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const feedbackId = query.data.split(":")[1];

    if (!this._isAdmin(userId)) {
      return;
    }

    try {
      const feedback = await this.database.getFeedbackById(feedbackId);

      if (!feedback) {
        await this.bot.editMessageText("❌ Feedback not found", {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Back to Feedback List",
                  callback_data: "view_feedback",
                },
              ],
            ],
          },
        });
        return;
      }

      const date = new Date(feedback.created_at).toLocaleDateString();
      const time = new Date(feedback.created_at).toLocaleTimeString();
      const studentInfo = feedback.student_id
        ? `${feedback.student_id}`
        : `User ${feedback.user_id}`;

      const message = `💬 *Feedback Details*

👤 *From:* ${feedback.user_name} ${feedback.user_username || ""}
🆔 *Student/User:* ${studentInfo}
📅 *Date:* ${date} ${time}
🆔 *Feedback ID:* ${feedback.id}

💭 *Message:*
"${feedback.message}"

📊 *Status:* ${feedback.replied ? "✅ Replied" : "⏳ Pending Reply"}`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "💬 Reply to Student",
              callback_data: `reply_feedback:${feedback.id}`,
            },
          ],
          [
            {
              text: "🔙 Back to Feedback List",
              callback_data: "view_feedback",
            },
          ],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      Logger.error("View feedback detail error:", error.message);

      await this.bot.editMessageText("❌ Error loading feedback details", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Back to Feedback List",
                callback_data: "view_feedback",
              },
            ],
          ],
        },
      });
    }
  }

  /**
   * Handle reply feedback callback
   */
  async handleReplyFeedbackCallback(query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const feedbackId = query.data.split(":")[1];

    if (!this._isAdmin(userId)) {
      return;
    }

    try {
      const feedback = await this.database.getFeedbackById(feedbackId);

      if (!feedback) {
        await this.bot.editMessageText("❌ Feedback not found", {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Back to Feedback List",
                  callback_data: "view_feedback",
                },
              ],
            ],
          },
        });
        return;
      }

      const studentInfo = feedback.student_id
        ? `${feedback.student_id}`
        : `User ${feedback.user_id}`;

      const message = `💬 *Reply to Feedback*

👤 *Student:* ${feedback.user_name} (${studentInfo})
💭 *Their message:* "${feedback.message}"

✍️ *Instructions:*
Type your reply message and send it. The student will receive your response directly.

⚠️ *Note:* Your next message will be sent as a reply to this student.`;

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "❌ Cancel Reply",
              callback_data: `view_feedback_detail:${feedbackId}`,
            },
          ],
          [
            {
              text: "🔙 Back to Feedback List",
              callback_data: "view_feedback",
            },
          ],
        ],
      };

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      // Set admin state to expect reply
      global.adminStates = global.adminStates || {};
      global.adminStates[userId] = {
        state: "waiting_reply",
        feedbackId: feedbackId,
        studentUserId: feedback.user_id,
        studentName: feedback.user_name,
        originalMessage: feedback.message,
        chatId: chatId,
        messageId: messageId,
      };
    } catch (error) {
      Logger.error("Reply feedback error:", error.message);

      await this.bot.editMessageText("❌ Error preparing reply", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Back to Feedback List",
                callback_data: "view_feedback",
              },
            ],
          ],
        },
      });
    }
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

    const keyboard = KeyboardBuilder.getBackToMenuKeyboard();

    await this.bot.editMessageText(`❌ ${fallbackMessage}`, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
    });
  }
}

module.exports = FeedbackHandlers;
