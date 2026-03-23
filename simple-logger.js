/**
 * Simple Logger for cPanel
 *
 * This logger writes to both console and files
 */

const fs = require("fs");
const path = require("path");

class SimpleLogger {
  constructor() {
    this.logsDir = "./logs";
    this.ensureLogsDir();
  }

  ensureLogsDir() {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create logs directory:", error.message);
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
  }

  writeToFile(filename, message) {
    try {
      const filePath = path.join(this.logsDir, filename);
      fs.appendFileSync(filePath, message + "\n");
    } catch (error) {
      console.error(`Failed to write to ${filename}:`, error.message);
    }
  }

  info(message, data = null) {
    const formatted = this.formatMessage("info", message, data);
    console.log(`ℹ️  ${formatted}`);
    this.writeToFile("app.log", formatted);
  }

  warn(message, data = null) {
    const formatted = this.formatMessage("warn", message, data);
    console.warn(`⚠️  ${formatted}`);
    this.writeToFile("app.log", formatted);
  }

  error(message, error = null, data = null) {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
          code: error.code,
          ...data,
        }
      : data;

    const formatted = this.formatMessage("error", message, errorData);
    console.error(`❌ ${formatted}`);
    this.writeToFile("errors.log", formatted);
    this.writeToFile("app.log", formatted);
  }

  cpanelIssue(issue, solution = null) {
    const message = `cPanel Issue: ${issue}${solution ? ` | Solution: ${solution}` : ""}`;
    const formatted = this.formatMessage("cpanel", message);
    console.log(`🔧 ${formatted}`);
    this.writeToFile("cpanel-issues.log", formatted);
  }

  botError(context, error, telegramData = null) {
    const message = `Bot error in ${context}: ${error.message}`;
    const data = { context, telegramData };
    this.error(message, error, data);
  }

  startup(message, data = null) {
    const formatted = this.formatMessage("startup", message, data);
    console.log(`🚀 ${formatted}`);
    this.writeToFile("app.log", formatted);
  }
}

// Create singleton instance
const logger = new SimpleLogger();

module.exports = logger;
