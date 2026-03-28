const config = require("../../config");
const Logger = require("../utils/logger");
const Validators = require("../utils/validators");

class MenuHandler {
  constructor(bot, database, excelService) {
    this.bot = bot;
    this.database = database;
    this.excelService = excelService;
  }

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
      switch (data) {
        case "check_result":
          await this.handleCheckResultCallback(chatId, messageId);
          break;

        case "upload_excel":
          await this.handleUploadExcelCallback(chatId, userId, messageId);
          break;

        case "system_status":
          await this.handleSystemStatusCallback(chatId, userId, messageId);
          break;

        case "help":
          await this.handleHelpCallback(chatId, userId, messageId);
          break;

        case "back_to_menu":
          await this.handleBackToMenuCallback(chatId, userId, messageId);
          break;

        case "refresh_menu":
          await this.handleRefreshMenuCallback(chatId, userId, messageId);
          break;

        case "refresh_status":
          await this.handleSystemStatusCallback(chatId, userId, messageId);
          break;

        case "column_settings":
          await this.handleColumnSettingsCallback(chatId, userId, messageId);
          break;

        case "toggle_column":
          await this.handleToggleColumnCallback(query);
          break;

        case "reset_columns":
          await this.handleResetColumnsCallback(chatId, userId, messageId);
          break;

        case "save_column_settings":
          await this.handleSaveColumnSettingsCallback(
            chatId,
            userId,
            messageId,
          );
          break;

        case "course_settings":
          await this.handleCourseSettingsCallback(chatId, userId, messageId);
          break;

        case "update_course_info":
          await this.handleUpdateCourseInfoCallback(query);
          break;

        case "feedback":
          await this.handleFeedbackCallback(chatId, userId, messageId);
          break;

        case "view_feedback":
          await this.handleViewFeedbackCallback(chatId, userId, messageId);
          break;

        default:
          // Handle toggle_column callbacks
          if (data.startsWith("toggle_column:")) {
            await this.handleToggleColumnCallback(query);
            break;
          }

          Logger.warning(`Unknown callback data: ${data}`);
          await this.bot.sendMessage(chatId, "❌ Unknown command");
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

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh", callback_data: "check_result" }],
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
      // Handle "message is not modified" error gracefully
      if (error.message.includes("message is not modified")) {
        Logger.info("Check result message content unchanged, skipping update");
        return;
      }

      Logger.error("Check result callback error:", error.message);

      // Fallback: send a simple check result message
      const fallbackMessage = `🔍 *Check Student Result*

Send your Student ID in format: XXXX/XX
Example: 0014/14

⚠️ *Error occurred, showing basic instructions*`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "check_result" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      try {
        await this.bot.editMessageText(fallbackMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      } catch (fallbackError) {
        Logger.error(
          "Fallback check result message failed:",
          fallbackError.message,
        );
        // Last resort: send new message
        await this.bot.sendMessage(
          chatId,
          "❌ Check result system temporarily unavailable. Please try /start",
        );
      }
    }
  }

  async handleUploadExcelCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
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
      // Handle "message is not modified" error gracefully
      if (error.message.includes("message is not modified")) {
        Logger.info("Upload excel message content unchanged, skipping update");
        return;
      }

      Logger.error("Upload excel callback error:", error.message);

      // Fallback: send a simple upload message
      const fallbackMessage = `📊 *Upload Excel File*

Upload your Excel file (.xlsx or .xls) with student data.

Required: Student Name, Student ID
Optional: Quiz, Mid, Assignment, Final, Total, Grade

⚠️ *Error occurred, showing basic instructions*`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "upload_excel" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      try {
        await this.bot.editMessageText(fallbackMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      } catch (fallbackError) {
        Logger.error(
          "Fallback upload excel message failed:",
          fallbackError.message,
        );
        // Last resort: send new message
        await this.bot.sendMessage(
          chatId,
          "❌ Upload system temporarily unavailable. Please try /start",
        );
      }
    }
  }

  async handleSystemStatusCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
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
          [{ text: "🔄 Refresh", callback_data: "system_status" }],
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
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Failed to get system status", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

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

      // Safely check if user is admin
      const isAdmin =
        config.ADMIN_USER_ID &&
        userId &&
        parseInt(userId) === parseInt(config.ADMIN_USER_ID);

      if (isAdmin) {
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
      }

      // Add timestamp to make content unique for refresh
      helpMessage += `\n\n🕐 *Last updated:* ${timestamp}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh Help", callback_data: "help" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(helpMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });
    } catch (error) {
      // Handle "message is not modified" error gracefully
      if (error.message.includes("message is not modified")) {
        Logger.info("Help message content unchanged, skipping update");
        // Just acknowledge the button press without updating the message
        return;
      }

      Logger.error("Help callback error:", error.message);

      // Fallback: send a simple help message
      const fallbackMessage = `📚 *Help & Commands*

🔍 *For Students:*
• Use "Check My Result" button
• Send your Student ID in format: XXXX/XX
• Example: 0014/14

📝 *Commands:*
• /start - Main menu
• /help - This help

⚠️ *Error occurred, showing basic help*`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "help" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      try {
        await this.bot.editMessageText(fallbackMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      } catch (fallbackError) {
        Logger.error("Fallback help message failed:", fallbackError.message);
        // Last resort: send new message
        await this.bot.sendMessage(
          chatId,
          "❌ Help system temporarily unavailable. Please try /start",
        );
      }
    }
  }

  async handleBackToMenuCallback(chatId, userId, messageId) {
    const welcomeMessage = `🎓 *Welcome to Student Results Bot!*

Choose an option below:`;

    const keyboard = this.getMainMenuKeyboard(userId);

    await this.bot.editMessageText(welcomeMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

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

    const keyboard = this.getRefreshableMainMenuKeyboard(userId);

    await this.bot.editMessageText(welcomeMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }

  getMainMenuKeyboard(userId) {
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

  getRefreshableMainMenuKeyboard(userId) {
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

  async handleColumnSettingsCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
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

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Failed to load column settings", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

  async handleToggleColumnCallback(query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;

    if (userId !== config.ADMIN_USER_ID) {
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

  async handleResetColumnsCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
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

  async handleSaveColumnSettingsCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
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

  getColumnDisplayName(column) {
    const displayNames = {
      quiz: "Quiz",
      mid: "Mid Term",
      assignment: "Assignment",
      groupAssignment: "Group Assignment",
      project: "Project",
      final: "Final Exam",
      total: "Total Score",
      grade: "Grade",
    };

    return (
      displayNames[column] || column.charAt(0).toUpperCase() + column.slice(1)
    );
  }

  async handleCourseSettingsCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
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

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh", callback_data: "course_settings" }],
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
      console.error("❌ Course settings error:", error.message);

      // If it's a "message not modified" error, just ignore it
      if (error.message.includes("message is not modified")) {
        console.log(
          "ℹ️ Course settings message content unchanged, skipping update",
        );
        return;
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Failed to load course settings", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }

  async handleUpdateCourseInfoCallback(query) {
    // This will be handled by the command handler when admin sends /course command
    // This callback is reserved for future use if we want to add inline editing
  }

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

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh", callback_data: "feedback" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

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
      // Handle "message is not modified" error gracefully
      if (error.message.includes("message is not modified")) {
        Logger.info("Feedback message content unchanged, skipping update");
        return;
      }

      Logger.error("Feedback callback error:", error.message);

      // Fallback: send a simple feedback message
      const fallbackMessage = `💬 *Send Feedback*

Type your feedback message and send it.
Your message will be sent to administrators.

⚠️ *Error occurred, showing basic instructions*`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Try Again", callback_data: "feedback" }],
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      try {
        await this.bot.editMessageText(fallbackMessage, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      } catch (fallbackError) {
        Logger.error(
          "Fallback feedback message failed:",
          fallbackError.message,
        );
        // Last resort: send new message
        await this.bot.sendMessage(
          chatId,
          "❌ Feedback system temporarily unavailable. Please try /start",
        );
      }
    }
  }

  async handleViewFeedbackCallback(chatId, userId, messageId) {
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Access denied. Admin only feature.", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
      return;
    }

    try {
      const feedbackList = await this.database.getRecentFeedback(10);
      const timestamp = new Date().toLocaleTimeString();

      let message = `💬 *Student Feedback*\n\n`;

      if (feedbackList.length === 0) {
        message += `📭 *No feedback received yet*\n\nStudents can send feedback using the "💬 Send Feedback" button in their menu.`;
      } else {
        message += `📊 *Recent Feedback (Last 10):*\n\n`;

        feedbackList.forEach((feedback, index) => {
          const date = new Date(feedback.created_at).toLocaleDateString();
          const time = new Date(feedback.created_at).toLocaleTimeString();
          const studentInfo = feedback.student_id
            ? `ID: ${feedback.student_id}`
            : `User: ${feedback.user_id}`;

          message += `**${index + 1}.** ${studentInfo}\n`;
          message += `📅 ${date} ${time}\n`;
          message += `💭 "${feedback.message}"\n\n`;
        });

        message += `💡 *Total feedback received:* ${feedbackList.length}`;
      }

      message += `\n\n🕐 *Last updated:* ${timestamp}`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔄 Refresh", callback_data: "view_feedback" }],
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
      // Handle "message is not modified" error gracefully
      if (error.message.includes("message is not modified")) {
        Logger.info("View feedback message content unchanged, skipping update");
        return;
      }

      Logger.error("View feedback callback error:", error.message);

      const keyboard = {
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText("❌ Failed to load feedback", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard,
      });
    }
  }
}

module.exports = MenuHandler;
