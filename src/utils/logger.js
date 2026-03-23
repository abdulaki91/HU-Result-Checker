class Logger {
  static info(message, ...args) {
    console.log(`ℹ️  ${message}`, ...args);
  }

  static success(message, ...args) {
    console.log(`✅ ${message}`, ...args);
  }

  static warning(message, ...args) {
    console.warn(`⚠️  ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`❌ ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (process.env.NODE_ENV === "development") {
      console.log(`🐛 ${message}`, ...args);
    }
  }
}

module.exports = Logger;
