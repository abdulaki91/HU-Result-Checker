class Validators {
  static isValidStudentId(studentId) {
    if (!studentId || typeof studentId !== "string") {
      return false;
    }

    const trimmed = studentId.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  }

  static isValidExcelFile(filename) {
    if (!filename || typeof filename !== "string") {
      return false;
    }

    const lowerName = filename.toLowerCase();
    return lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");
  }

  static sanitizeInput(input) {
    if (typeof input !== "string") {
      return "";
    }

    return input.trim().replace(/[<>]/g, "");
  }

  static isAdmin(userId) {
    const config = require("../../config");
    return userId === config.ADMIN_USER_ID;
  }
}

module.exports = Validators;
