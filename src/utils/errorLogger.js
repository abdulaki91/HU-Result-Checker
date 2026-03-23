const fs = require("fs").promises;
const path = require("path");

class ErrorLogger {
  constructor() {
    this.logsDir = "./logs";
    this.errorFile = path.join(this.logsDir, "errors.log");
    this.appFile = path.join(this.logsDir, "app.log");
    this.cpanelFile = path.join(this.logsDir, "cpanel-issues.log");
    this.setupLogging();
  }

  async setupLogging() {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create logs directory:", error.message);
    }
  }

  formatLogEntry(level, message, data = null, error = null) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: Math.floor(process.uptime()),
      data: data || undefined,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errno: error.errno,
          }
        : undefined,
    };

    return JSON.stringify(entry) + "\n";
  }

  async writeLog(file, entry) {
    try {
      await fs.appendFile(file, entry);
    } catch (error) {
      console.error(`Failed to write to ${file}:`, error.message);
    }
  }

  async info(message, data = null) {
    const entry = this.formatLogEntry("info", message, data);
    await this.writeLog(this.appFile, entry);
    console.log(`ℹ️  ${message}`, data ? JSON.stringify(data) : "");
  }

  async warn(message, data = null) {
    const entry = this.formatLogEntry("warn", message, data);
    await this.writeLog(this.appFile, entry);
    console.warn(`⚠️  ${message}`, data ? JSON.stringify(data) : "");
  }

  async error(message, error = null, data = null) {
    const entry = this.formatLogEntry("error", message, data, error);
    await this.writeLog(this.errorFile, entry);
    await this.writeLog(this.appFile, entry);
    console.error(
      `❌ ${message}`,
      error ? error.message : "",
      data ? JSON.stringify(data) : "",
    );
  }

  async cpanelIssue(issue, details = null, solution = null) {
    const entry = this.formatLogEntry("cpanel", issue, { details, solution });
    await this.writeLog(this.cpanelFile, entry);
    console.log(`🔧 cPanel Issue: ${issue}`);
    if (details) console.log(`   Details: ${details}`);
    if (solution) console.log(`   Solution: ${solution}`);
  }

  async botError(context, error, telegramData = null) {
    const entry = this.formatLogEntry(
      "bot_error",
      `Bot error in ${context}`,
      {
        context,
        telegramData,
        userAgent: process.env.USER_AGENT,
        nodeEnv: process.env.NODE_ENV,
      },
      error,
    );

    await this.writeLog(this.errorFile, entry);
    console.error(`🤖 Bot Error [${context}]:`, error.message);
  }

  async webhookError(update, error) {
    const entry = this.formatLogEntry(
      "webhook_error",
      "Webhook processing failed",
      {
        update,
        webhookUrl:
          process.env.WEBHOOK_URL || process.env.BOT_BASE_URL + "/webhook",
      },
      error,
    );

    await this.writeLog(this.errorFile, entry);
    console.error(`🔗 Webhook Error:`, error.message);
  }

  async databaseError(operation, error, query = null) {
    const entry = this.formatLogEntry(
      "database_error",
      `Database ${operation} failed`,
      {
        operation,
        query,
        dbHost: process.env.DB_HOST,
        dbName: process.env.DB_NAME,
        dbUser: process.env.DB_USER,
      },
      error,
    );

    await this.writeLog(this.errorFile, entry);
    console.error(`🗄️  Database Error [${operation}]:`, error.message);
  }

  async startupError(component, error) {
    const entry = this.formatLogEntry(
      "startup_error",
      `Failed to start ${component}`,
      {
        component,
        nodeVersion: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        env: process.env.NODE_ENV,
      },
      error,
    );

    await this.writeLog(this.errorFile, entry);
    console.error(`🚀 Startup Error [${component}]:`, error.message);
  }

  async generateErrorSummary() {
    try {
      const errorLog = await fs.readFile(this.errorFile, "utf8");
      const errors = errorLog
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const summary = {
        totalErrors: errors.length,
        lastError: errors[errors.length - 1],
        errorTypes: {},
        commonErrors: {},
        timeRange: {
          first: errors[0]?.timestamp,
          last: errors[errors.length - 1]?.timestamp,
        },
      };

      // Count error types
      errors.forEach((error) => {
        const type = error.level || "unknown";
        summary.errorTypes[type] = (summary.errorTypes[type] || 0) + 1;

        const message = error.message || "unknown";
        summary.commonErrors[message] =
          (summary.commonErrors[message] || 0) + 1;
      });

      const summaryFile = path.join(this.logsDir, "error-summary.json");
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));

      console.log("\n📊 ERROR SUMMARY:");
      console.log("==================");
      console.log(`Total Errors: ${summary.totalErrors}`);
      console.log(`Error Types:`, summary.errorTypes);
      console.log(
        `Time Range: ${summary.timeRange.first} to ${summary.timeRange.last}`,
      );
      console.log(`Summary saved to: ${summaryFile}`);

      return summary;
    } catch (error) {
      console.error("Failed to generate error summary:", error.message);
    }
  }

  async clearLogs() {
    try {
      await fs.writeFile(this.errorFile, "");
      await fs.writeFile(this.appFile, "");
      await fs.writeFile(this.cpanelFile, "");
      console.log("✅ All log files cleared");
    } catch (error) {
      console.error("Failed to clear logs:", error.message);
    }
  }
}

module.exports = ErrorLogger;
