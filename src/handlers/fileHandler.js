const path = require("path");
const config = require("../../config");

class FileHandler {
  constructor(bot, database, excelService) {
    this.bot = bot;
    this.database = database;
    this.excelService = excelService;
    this.isProcessing = false;
  }

  async handleDocumentUpload(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user is admin
    if (userId !== config.ADMIN_USER_ID) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(
        chatId,
        "❌ Access denied. Only admin can upload files.",
        {
          reply_markup: keyboard,
        },
      );
      return;
    }

    // Check if already processing
    if (this.isProcessing) {
      await this.bot.sendMessage(
        chatId,
        "⏳ Another file is being processed. Please wait...",
      );
      return;
    }

    const document = msg.document;

    // Validate file type
    if (
      !document.file_name.toLowerCase().endsWith(".xlsx") &&
      !document.file_name.toLowerCase().endsWith(".xls")
    ) {
      const keyboard = {
        inline_keyboard: [
          [{ text: "📊 Try Upload Again", callback_data: "upload_excel" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.sendMessage(
        chatId,
        "❌ Please upload an Excel file (.xlsx or .xls)",
        {
          reply_markup: keyboard,
        },
      );
      return;
    }

    this.isProcessing = true;
    const processingMsg = await this.bot.sendMessage(
      chatId,
      "⏳ Processing Excel file...",
    );

    try {
      // Download file
      const fileInfo = await this.bot.getFile(document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${fileInfo.file_path}`;
      const tempFilePath = path.join(
        "./temp",
        `${Date.now()}_${document.file_name}`,
      );

      await this.excelService.downloadFile(fileUrl, tempFilePath);

      // Parse Excel file
      await this.bot.editMessageText("📊 Parsing Excel data...", {
        chat_id: chatId,
        message_id: processingMsg.message_id,
      });

      const studentsData = this.excelService.parseExcelFile(tempFilePath);

      // Save to database
      await this.bot.editMessageText("💾 Saving to database...", {
        chat_id: chatId,
        message_id: processingMsg.message_id,
      });

      await this.database.saveStudents(studentsData);

      // Cleanup
      await this.excelService.cleanupFile(tempFilePath);

      // Success message
      const successMessage = `✅ *File processed successfully!*

📊 *Summary:*
• Students processed: ${studentsData.length}
• File: ${document.file_name}
• Updated: ${new Date().toLocaleString()}

🎯 Students can now check their results by sending their Student ID.`;

      const successKeyboard = {
        inline_keyboard: [
          [{ text: "📊 Upload Another File", callback_data: "upload_excel" }],
          [{ text: "📈 System Status", callback_data: "system_status" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(successMessage, {
        chat_id: chatId,
        message_id: processingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: successKeyboard,
      });
    } catch (error) {
      console.error("❌ File processing error:", error.message);

      const errorMessage = `❌ *Failed to process file*

Error: ${error.message}

💡 *Please check:*
• File format is correct (.xlsx or .xls)
• Remove merged cells from Excel
• Ensure first row has clear column headers
• Remove empty rows above data`;

      const errorKeyboard = {
        inline_keyboard: [
          [{ text: "📊 Try Upload Again", callback_data: "upload_excel" }],
          [{ text: "❓ Help", callback_data: "help" }],
          [{ text: "🏠 Main Menu", callback_data: "back_to_menu" }],
        ],
      };

      await this.bot.editMessageText(errorMessage, {
        chat_id: chatId,
        message_id: processingMsg.message_id,
        parse_mode: "Markdown",
        reply_markup: errorKeyboard,
      });
    } finally {
      this.isProcessing = false;
    }
  }

  getProcessingStatus() {
    return this.isProcessing;
  }
}

module.exports = FileHandler;
