#!/usr/bin/env node

/**
 * cPanel Diagnostics and Error Logging Tool
 *
 * This script helps diagnose issues on cPanel hosting
 */

const fs = require("fs").promises;
const path = require("path");

class CPanelDiagnostics {
  constructor() {
    this.logFile = "./logs/cpanel-diagnostics.log";
    this.errorFile = "./logs/cpanel-errors.log";
    this.setupLogDirectory();
  }

  async setupLogDirectory() {
    try {
      await fs.mkdir("./logs", { recursive: true });
    } catch (error) {
      console.error("Failed to create logs directory:", error.message);
    }
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? " | Data: " + JSON.stringify(data) : ""}\n`;

    try {
      await fs.appendFile(this.logFile, logLine);
      if (level === "error") {
        await fs.appendFile(this.errorFile, logLine);
      }
    } catch (error) {
      console.error("Failed to write log:", error.message);
    }

    console.log(logLine.trim());
  }

  async runDiagnostics() {
    await this.log("info", "Starting cPanel diagnostics");

    try {
      // Check Node.js environment
      await this.checkNodeEnvironment();

      // Check file system
      await this.checkFileSystem();

      // Check dependencies
      await this.checkDependencies();

      // Check configuration
      await this.checkConfiguration();

      // Check database connection
      await this.checkDatabase();

      // Check network/ports
      await this.checkNetwork();

      // Generate summary report
      await this.generateReport();
    } catch (error) {
      await this.log("error", "Diagnostics failed", {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async checkNodeEnvironment() {
    await this.log("info", "Checking Node.js environment");

    const nodeInfo = {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      execPath: process.execPath,
      argv: process.argv,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        HOME: process.env.HOME,
        USER: process.env.USER,
        PATH: process.env.PATH?.substring(0, 200) + "...", // Truncate PATH
      },
    };

    await this.log("info", "Node.js environment check complete", nodeInfo);
  }

  async checkFileSystem() {
    await this.log("info", "Checking file system");

    try {
      const requiredFiles = [
        "package.json",
        "app.js",
        "config.js",
        "database.js",
        "src/bot/StudentResultsBot.js",
      ];

      const fileChecks = {};

      for (const file of requiredFiles) {
        try {
          const stats = await fs.stat(file);
          fileChecks[file] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime,
            permissions: stats.mode.toString(8),
          };
        } catch (error) {
          fileChecks[file] = {
            exists: false,
            error: error.message,
          };
        }
      }

      // Check directories
      const requiredDirs = [
        "src",
        "src/bot",
        "src/handlers",
        "src/utils",
        "temp",
        "logs",
      ];
      const dirChecks = {};

      for (const dir of requiredDirs) {
        try {
          const stats = await fs.stat(dir);
          dirChecks[dir] = {
            exists: true,
            isDirectory: stats.isDirectory(),
            permissions: stats.mode.toString(8),
          };
        } catch (error) {
          dirChecks[dir] = {
            exists: false,
            error: error.message,
          };
        }
      }

      await this.log("info", "File system check complete", {
        files: fileChecks,
        directories: dirChecks,
      });
    } catch (error) {
      await this.log("error", "File system check failed", {
        error: error.message,
      });
    }
  }

  async checkDependencies() {
    await this.log("info", "Checking dependencies");

    try {
      // Check if node_modules exists
      const nodeModulesExists = await fs
        .access("node_modules")
        .then(() => true)
        .catch(() => false);

      if (!nodeModulesExists) {
        await this.log(
          "error",
          "node_modules directory not found - run npm install",
        );
        return;
      }

      // Check critical dependencies
      const criticalDeps = [
        "express",
        "node-telegram-bot-api",
        "mysql2",
        "xlsx",
        "dotenv",
      ];

      const depChecks = {};

      for (const dep of criticalDeps) {
        try {
          const depPath = path.join("node_modules", dep);
          await fs.access(depPath);

          // Try to require the module
          const module = require(dep);
          depChecks[dep] = {
            installed: true,
            canRequire: true,
            version: module.version || "unknown",
          };
        } catch (error) {
          depChecks[dep] = {
            installed: false,
            canRequire: false,
            error: error.message,
          };
        }
      }

      await this.log("info", "Dependencies check complete", depChecks);
    } catch (error) {
      await this.log("error", "Dependencies check failed", {
        error: error.message,
      });
    }
  }

  async checkConfiguration() {
    await this.log("info", "Checking configuration");

    try {
      // Load environment variables
      require("dotenv").config();

      const config = {
        BOT_TOKEN: process.env.BOT_TOKEN ? "SET" : "MISSING",
        ADMIN_USER_ID: process.env.ADMIN_USER_ID ? "SET" : "MISSING",
        BOT_BASE_URL: process.env.BOT_BASE_URL || "NOT SET",
        CPANEL_DOMAIN: process.env.CPANEL_DOMAIN || "NOT SET",
        NODE_ENV: process.env.NODE_ENV || "NOT SET",
        DB_HOST: process.env.DB_HOST || "NOT SET",
        DB_USER: process.env.DB_USER ? "SET" : "MISSING",
        DB_PASSWORD: process.env.DB_PASSWORD ? "SET" : "MISSING",
        DB_NAME: process.env.DB_NAME || "NOT SET",
        USE_JSON_STORAGE: process.env.USE_JSON_STORAGE || "false",
      };

      // Check config.js
      try {
        const configModule = require("./config");
        await this.log("info", "config.js loaded successfully", {
          envVars: config,
          configKeys: Object.keys(configModule),
        });
      } catch (error) {
        await this.log("error", "Failed to load config.js", {
          error: error.message,
        });
      }
    } catch (error) {
      await this.log("error", "Configuration check failed", {
        error: error.message,
      });
    }
  }

  async checkDatabase() {
    await this.log("info", "Checking database connection");

    try {
      const { Database } = require("./database");
      const db = new Database();

      await db.initialize();
      await this.log("info", "Database connection successful");

      // Test a simple query
      const students = await db.getAllStudents();
      await this.log("info", "Database query test successful", {
        studentCount: students.length,
        sampleStudent: students[0] || "No students found",
      });

      await db.close();
    } catch (error) {
      await this.log("error", "Database connection failed", {
        error: error.message,
        code: error.code,
        errno: error.errno,
      });
    }
  }

  async checkNetwork() {
    await this.log("info", "Checking network configuration");

    try {
      const config = require("./config");

      const networkInfo = {
        port: config.PORT || process.env.PORT || 3000,
        baseUrl: config.FULL_BASE_URL,
        webhookUrl: config.FULL_WEBHOOK_URL,
        statusUrl: config.FULL_STATUS_URL,
        healthUrl: config.FULL_HEALTH_URL,
      };

      await this.log("info", "Network configuration", networkInfo);

      // Test if we can create a server
      const http = require("http");
      const testServer = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Test server working");
      });

      testServer.listen(0, () => {
        const port = testServer.address().port;
        this.log("info", "Test server created successfully", {
          testPort: port,
        });
        testServer.close();
      });

      testServer.on("error", (error) => {
        this.log("error", "Test server failed", { error: error.message });
      });
    } catch (error) {
      await this.log("error", "Network check failed", { error: error.message });
    }
  }

  async generateReport() {
    await this.log("info", "Generating diagnostic report");

    const reportData = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        hasEnvFile: await fs
          .access(".env")
          .then(() => true)
          .catch(() => false),
        hasNodeModules: await fs
          .access("node_modules")
          .then(() => true)
          .catch(() => false),
      },
      recommendations: [],
    };

    // Generate recommendations
    if (!reportData.environment.hasEnvFile) {
      reportData.recommendations.push(
        "Create .env file with your configuration",
      );
    }

    if (!reportData.environment.hasNodeModules) {
      reportData.recommendations.push(
        'Run "npm install" to install dependencies',
      );
    }

    if (!process.env.BOT_TOKEN) {
      reportData.recommendations.push("Set BOT_TOKEN in .env file");
    }

    if (!process.env.ADMIN_USER_ID) {
      reportData.recommendations.push("Set ADMIN_USER_ID in .env file");
    }

    const reportFile = "./logs/diagnostic-report.json";
    await fs.writeFile(reportFile, JSON.stringify(reportData, null, 2));

    await this.log("info", "Diagnostic report generated", {
      reportFile,
      recommendations: reportData.recommendations,
    });

    console.log("\n📋 DIAGNOSTIC REPORT SUMMARY:");
    console.log("================================");
    console.log(`Node.js Version: ${reportData.system.nodeVersion}`);
    console.log(`Platform: ${reportData.system.platform}`);
    console.log(`Working Directory: ${reportData.system.cwd}`);
    console.log(`Environment: ${reportData.environment.NODE_ENV || "Not set"}`);
    console.log(
      `Has .env file: ${reportData.environment.hasEnvFile ? "Yes" : "No"}`,
    );
    console.log(
      `Has node_modules: ${reportData.environment.hasNodeModules ? "Yes" : "No"}`,
    );

    if (reportData.recommendations.length > 0) {
      console.log("\n⚠️  RECOMMENDATIONS:");
      reportData.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    } else {
      console.log("\n✅ No critical issues found!");
    }

    console.log(`\n📄 Full report saved to: ${reportFile}`);
    console.log(`📄 Error log: ${this.errorFile}`);
    console.log(`📄 Full log: ${this.logFile}`);
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  const diagnostics = new CPanelDiagnostics();
  diagnostics.runDiagnostics().catch(console.error);
}

module.exports = CPanelDiagnostics;
