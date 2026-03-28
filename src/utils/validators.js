class Validators {
  static isValidStudentId(studentId) {
    if (!studentId || typeof studentId !== "string") {
      return false;
    }

    const trimmed = studentId.trim();

    // Check for the required format: XXXX/XX (e.g., 0014/14)
    const idPattern = /^\d{4}\/\d{2}$/;
    return idPattern.test(trimmed);
  }

  static isValidStudentIdForSearch(studentId) {
    if (!studentId || typeof studentId !== "string") {
      return false;
    }

    const trimmed = studentId.trim();

    // For search, accept the full format XXXX/XX
    const idPattern = /^\d{4}\/\d{2}$/;
    return idPattern.test(trimmed);
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
