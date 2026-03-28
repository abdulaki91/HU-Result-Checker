/**
 * Keyboard Builder Module
 * Handles all menu keyboard generation
 */

const config = require("../../../config");

class KeyboardBuilder {
  /**
   * Get main menu keyboard based on user role
   */
  static getMainMenuKeyboard(userId) {
    if (userId === config.ADMIN_USER_ID) {
      // Admin keyboard with additional options
      return {
        inline_keyboard: [
          [
            { text: "🔍 Check Student Result", callback_data: "check_result" },
            { text: "📊 Upload Excel File", callback_data: "upload_excel" },
          ],
          [
            { text: "📈 System Status", callback_data: "system_status" },
            { text: "⚙️ Column Settings", callback_data: "column_settings" },
          ],
          [
            { text: "📚 Course Settings", callback_data: "course_settings" },
            { text: "💬 View Feedback", callback_data: "view_feedback" },
          ],
          [{ text: "❓ Help", callback_data: "help" }],
          [{ text: "🔄 Refresh Menu", callback_data: "refresh_menu" }],
        ],
      };
    } else {
      // Student keyboard
      return {
        inline_keyboard: [
          [{ text: "🔍 Check My Result", callback_data: "check_result" }],
          [{ text: "💬 Send Feedback", callback_data: "feedback" }],
          [{ text: "❓ Help", callback_data: "help" }],
          [{ text: "🔄 Refresh Menu", callback_data: "refresh_menu" }],
        ],
      };
    }
  }

  /**
   * Get refreshable main menu keyboard (with "Refresh Again" text)
   */
  static getRefreshableMainMenuKeyboard(userId) {
    if (userId === config.ADMIN_USER_ID) {
      // Admin keyboard with additional options and refresh
      return {
        inline_keyboard: [
          [
            { text: "🔍 Check Student Result", callback_data: "check_result" },
            { text: "📊 Upload Excel File", callback_data: "upload_excel" },
          ],
          [
            { text: "📈 System Status", callback_data: "system_status" },
            { text: "⚙️ Column Settings", callback_data: "column_settings" },
          ],
          [
            { text: "📚 Course Settings", callback_data: "course_settings" },
            { text: "💬 View Feedback", callback_data: "view_feedback" },
          ],
          [{ text: "❓ Help", callback_data: "help" }],
          [{ text: "🔄 Refresh Again", callback_data: "refresh_menu" }],
        ],
      };
    } else {
      // Student keyboard with refresh
      return {
        inline_keyboard: [
          [{ text: "🔍 Check My Result", callback_data: "check_result" }],
          [{ text: "💬 Send Feedback", callback_data: "feedback" }],
          [{ text: "❓ Help", callback_data: "help" }],
          [{ text: "🔄 Refresh Again", callback_data: "refresh_menu" }],
        ],
      };
    }
  }

  /**
   * Get basic back to menu keyboard
   */
  static getBackToMenuKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
      ],
    };
  }

  /**
   * Get keyboard with refresh and back options
   */
  static getRefreshBackKeyboard(refreshCallback) {
    return {
      inline_keyboard: [
        [{ text: "🔄 Refresh", callback_data: refreshCallback }],
        [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
      ],
    };
  }

  /**
   * Get keyboard for student actions (try again, back to menu)
   */
  static getStudentActionKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "🔍 Try Again", callback_data: "check_result" }],
        [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
      ],
    };
  }

  /**
   * Get keyboard for check result actions
   */
  static getCheckResultKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "🔍 Check Another Result", callback_data: "check_result" }],
        [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
      ],
    };
  }

  /**
   * Get keyboard for feedback actions
   */
  static getFeedbackActionKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "💬 Send More Feedback", callback_data: "feedback" }],
        [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
      ],
    };
  }

  /**
   * Get keyboard for admin feedback management
   */
  static getAdminFeedbackKeyboard() {
    return {
      inline_keyboard: [
        [{ text: "💬 View All Feedback", callback_data: "view_feedback" }],
        [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
      ],
    };
  }
}

module.exports = KeyboardBuilder;
