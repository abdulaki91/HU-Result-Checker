class MessageHandler {
  constructor(bot, database, excelService) {
    this.bot = bot;
    this.database = database;
    this.excelService = excelService;
  }

  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

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
}

module.exports = MessageHandler;
