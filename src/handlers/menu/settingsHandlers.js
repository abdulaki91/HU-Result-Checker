/**
 * Settings Handlers Module
 * Handles column and course settings functionality
 */

const config = require("../../../config");
const Logger = require("../../utils/logger");
const KeyboardBuilder = require("./keyboardBuilder");

class SettingsHandlers {
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
   * Handle column settings callback
   */
  async handleColumnSettingsCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      // Get available columns from database
      const availableColumns = await this.database.getAvailableColumns();
      const columnSettings = await this.database.getColumnSettings();

      let message = `⚙️ *Column Display Settings*

Choose which columns to show in student results:

`;

      const keyboard = { inline_keyboard: [] };

      // Create toggle buttons for each available column
      const columnButtons = [];
      for (const column of availableColumns) {
        const isVisible = columnSettings[column] !== false;
        const emoji = isVisible ? "✅" : "❌";
        const displayName = this.getColumnDisplayName(column);

        columnButtons.push({
          text: `${emoji} ${displayName}`,
          callback_data: `toggle_column:${column}`,
        });
      }

      // Arrange buttons in rows of 2
      for (let i = 0; i < columnButtons.length; i += 2) {
        const row = columnButtons.slice(i, i + 2);
        keyboard.inline_keyboard.push(row);
      }

      // Add control buttons
      keyboard.inline_keyboard.push([
        { text: "🔄 Reset All", callback_data: "reset_columns" },
        { text: "💾 Save Settings", callback_data: "save_column_settings" },
      ]);

      keyboard.inline_keyboard.push([
        { text: "🔙 Back to Menu", callback_data: "back_to_menu" },
      ]);

      message += `\n💡 *Tips:*
• ✅ = Column will be shown to students
• ❌ = Column will be hidden from students
• Name and ID are always shown
• Click to toggle visibility`;

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Column settings error:", error.message);

      const keyboard = KeyboardBuilder.getBackToMenuKeyboard();

      await this.bot.editMessageText("❌ Failed to load column settings", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

  /**
   * Handle toggle column callback
   */
  async handleToggleColumnCallback(query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;

    if (!this._isAdmin(userId)) {
      return;
    }

    try {
      const columnName = query.data.split(":")[1];
      await this.database.toggleColumnVisibility(columnName);

      // Refresh the column settings display
      await this.handleColumnSettingsCallback(chatId, userId, messageId);
    } catch (error) {
      console.error("❌ Toggle column error:", error.message);
    }
  }

  /**
   * Handle reset columns callback
   */
  async handleResetColumnsCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      return;
    }

    try {
      await this.database.resetColumnSettings();

      // Refresh the column settings display
      await this.handleColumnSettingsCallback(chatId, userId, messageId);
    } catch (error) {
      console.error("❌ Reset columns error:", error.message);
    }
  }

  /**
   * Handle save column settings callback
   */
  async handleSaveColumnSettingsCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      return;
    }

    try {
      // Show confirmation message
      const keyboard = {
        inline_keyboard: [
          [{ text: "⚙️ Column Settings", callback_data: "column_settings" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(
        "✅ *Column Settings Saved!*\n\nYour column visibility settings have been saved successfully. Students will now see results according to your preferences.",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        },
      );
    } catch (error) {
      console.error("❌ Save column settings error:", error.message);
    }
  }

  /**
   * Handle course settings callback
   */
  async handleCourseSettingsCallback(chatId, userId, messageId) {
    if (!this._isAdmin(userId)) {
      await this._handleAccessDenied(chatId, messageId);
      return;
    }

    try {
      const courseSettings = await this.database.getCourseSettings();

      const message = `📚 *Course Settings*

Current course information:

📖 *Course Name:* ${courseSettings.courseName}
👨‍🏫 *Instructor Name:* ${courseSettings.instructorName}

This information will be displayed to students when they check their results.

To update course information, please send the details in this format:
\`/course [Course Name] | [Instructor Name]\`

*Example:*
\`/course Computer Science 101 | Dr. John Smith\`

🕐 *Last updated:* ${new Date().toLocaleString()}`;

      const keyboard = KeyboardBuilder.getRefreshBackKeyboard("course_settings");

      await this.bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      console.error("❌ Course settings error:", error.message);

      // If it's a "message not modified" error, just ignore it
      if (error.message.includes("message is not modified")) {
        console.log(
          "ℹ️ Course settings message content unchanged, skipping update",
        );
        return;
      }

      const keyboard = KeyboardBuilder.getBackToMenuKeyboard();

      await this.bot.editMessageText("❌ Failed to load course settings", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

  /**
   * Handle update course info callback (placeholder for future use)
   */
  async handleUpdateCourseInfoCallback(query) {
    // This will be handled by the command handler when admin sends /course command
    // This callback is reserved for future use if we want to add inline editing
  }

  /**
   * Get display name for column
   */
  getColumnDisplayName(column) {
    const displayNames = {
      quiz: "Quiz",
      mid: "Mid Exam",
      assignment: "Assignment",
      group_assignment: "Group Assignment",
      project: "Project",
      final: "Final Exam",
      total: "Total Score",
      grade: "Grade",
    };

    return displayNames[column] || column.charAt(0).toUpperCase() + column.slice(1);
  }
}

module.exports = SettingsHandlers;