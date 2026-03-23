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

    // Assume any text message is a student ID lookup
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

💡 *Try these formats:*
• Full ID: GPR0015/15, STU001, REG123
• Short ID: 0015/15, 001, 123
• Check spelling and format

💡 *Please check:*
• Your Student ID is correct
• Results have been uploaded by admin
• Try different ID format if applicable

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
