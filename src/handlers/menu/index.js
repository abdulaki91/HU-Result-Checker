/**
 * Modular Menu Handler
 * Main coordinator for all menu functionality
 */

const config = require("../../../config");
const Logger = require("../../utils/logger");

// Import all handler modules
const KeyboardBuilder = require("./keyboardBuilder");
const StudentHandlers = require("./studentHandlers");
const AdminHandlers = require("./adminHandlers");
const FeedbackHandlers = require("./feedbackHandlers");
const SettingsHandlers = require("./settingsHandlers");

class ModularMenuHandler {
  constructor(bot, database, excelService) {
    this.bot = bot;
    this.database = database;
    this.excelService = excelService;

    // Initialize handler modules
    this.studentHandlers = new StudentHandlers(bot, database);
    this.adminHandlers = new AdminHandlers(bot, database);
    this.feedbackHandlers = new FeedbackHandlers(bot, database);
    this.settingsHandlers = new SettingsHandlers(bot, database);
  }

  /**
   * Main callback query router
   */
  async handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const messageId = query.message.message_id;

    // Answer the callback query to remove loading state
    try {
      await this.bot.answerCallbackQuery(query.id);
    } catch (error) {
      Logger.warning("Failed to answer callback query:", error.message);
    }

    try {
      // Route to appropriate handler based on callback data
      switch (data) {
        // Student handlers
        case "check_result":
          await this.studentHandlers.handleCheckResultCallback(
            chatId,
            messageId,
          );
          break;

        case "feedback":
          await this.studentHandlers.handleFeedbackCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "help":
          if (this._isAdmin(userId)) {
            await this.adminHandlers.handleAdminHelpCallback(
              chatId,
              userId,
              messageId,
            );
          } else {
            await this.studentHandlers.handleHelpCallback(
              chatId,
              userId,
              messageId,
            );
          }
          break;

        case "back_to_menu":
          await this.studentHandlers.handleBackToMenuCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "refresh_menu":
          await this.studentHandlers.handleRefreshMenuCallback(
            chatId,
            userId,
            messageId,
            query,
          );
          break;

        // Admin handlers
        case "upload_excel":
          await this.adminHandlers.handleUploadExcelCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "system_status":
          await this.adminHandlers.handleSystemStatusCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        // Feedback handlers
        case "view_feedback":
          await this.feedbackHandlers.handleViewFeedbackCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        // Settings handlers
        case "column_settings":
          await this.settingsHandlers.handleColumnSettingsCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "reset_columns":
          await this.settingsHandlers.handleResetColumnsCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "save_column_settings":
          await this.settingsHandlers.handleSaveColumnSettingsCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "course_settings":
          await this.settingsHandlers.handleCourseSettingsCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "update_course_info":
          await this.settingsHandlers.handleUpdateCourseInfoCallback(query);
          break;

        // Clear data handlers
        case "clear_all_data":
          await this.adminHandlers.handleClearAllDataCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "confirm_clear_all":
          await this.adminHandlers.handleConfirmClearAllCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        default:
          // Handle complex callback data with parameters
          await this._handleParameterizedCallbacks(query);
      }
    } catch (error) {
      Logger.error("Callback query error:", error.message);
      try {
        await this.bot.sendMessage(
          chatId,
          "❌ An error occurred. Please try again.",
        );
      } catch (sendError) {
        Logger.error("Failed to send error message:", sendError.message);
      }
    }
  }

  /**
   * Handle callbacks with parameters (e.g., "view_feedback_detail:123")
   */
  async _handleParameterizedCallbacks(query) {
    const data = query.data;

    // Handle feedback detail callbacks
    if (data.startsWith("view_feedback_detail:")) {
      await this.feedbackHandlers.handleViewFeedbackDetailCallback(query);
      return;
    }

    // Handle reply to feedback callbacks
    if (data.startsWith("reply_feedback:")) {
      await this.feedbackHandlers.handleReplyFeedbackCallback(query);
      return;
    }

    // Handle toggle column callbacks
    if (data.startsWith("toggle_column:")) {
      await this.settingsHandlers.handleToggleColumnCallback(query);
      return;
    }

    // Unknown callback
    Logger.warning(`Unknown callback data: ${data}`);
    await this.bot.sendMessage(query.message.chat.id, "❌ Unknown command");
  }

  /**
   * Get main menu keyboard (delegated to KeyboardBuilder)
   */
  getMainMenuKeyboard(userId) {
    return KeyboardBuilder.getMainMenuKeyboard(userId);
  }

  /**
   * Get refreshable main menu keyboard (delegated to KeyboardBuilder)
   */
  getRefreshableMainMenuKeyboard(userId) {
    return KeyboardBuilder.getRefreshableMainMenuKeyboard(userId);
  }

  /**
   * Check if user is admin
   */
  _isAdmin(userId) {
    return (
      config.ADMIN_USER_ID &&
      userId &&
      parseInt(userId) === parseInt(config.ADMIN_USER_ID)
    );
  }
}

module.exports = ModularMenuHandler;
