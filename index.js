/**
 * Simple Test File for cPanel Connection Testing
 *
 * This file tests basic Node.js functionality on cPanel
 * Use this as startup file in cPanel to test if everything works
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Configuration
const PORT = process.env.PORT || 3000;
const BASE_PATH =
  process.env.BOT_PATH || "/repositories/telegram-student-results-bot";

// Simple HTTP server
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  console.log(`${new Date().toISOString()} - ${method} ${url}`);

  try {
    if (url === "/" || url === BASE_PATH || url === `${BASE_PATH}/`) {
      handleHome(req, res);
    } else if (url === "/test" || url === `${BASE_PATH}/test`) {
      handleTest(req, res);
    } else if (url === "/env" || url === `${BASE_PATH}/env`) {
      handleEnv(req, res);
    } else if (url === "/files" || url === `${BASE_PATH}/files`) {
      handleFiles(req, res);
    } else if (url === "/database" || url === `${BASE_PATH}/database`) {
      handleDatabase(req, res);
    } else if (url === "/logs" || url === `${BASE_PATH}/logs`) {
      handleLogs(req, res);
    } else {
      handle404(req, res);
    }
  } catch (error) {
    handleError(req, res, error);
  }
});

function handleHome(req, res) {
  const response = {
    status: "SUCCESS",
    message: "cPanel Node.js Connection Test - WORKING!",
    timestamp: new Date().toISOString(),
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      pid: process.pid,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || "not set",
      PORT: process.env.PORT || "not set",
      BOT_PATH: process.env.BOT_PATH || "not set",
      PWD: process.env.PWD || "not set",
      USER: process.env.USER || "not set",
    },
    urls: {
      home: `http://checkresultbot.abdiko.com${BASE_PATH}`,
      test: `http://checkresultbot.abdiko.com${BASE_PATH}/test`,
      env: `http://checkresultbot.abdiko.com${BASE_PATH}/env`,
      files: `http://checkresultbot.abdiko.com${BASE_PATH}/files`,
      database: `http://checkresultbot.abdiko.com${BASE_PATH}/database`,
      logs: `http://checkresultbot.abdiko.com${BASE_PATH}/logs`,
    },
    instructions: [
      "✅ Node.js is working on cPanel!",
      "🔗 Visit /test to run system tests",
      "🌍 Visit /env to check environment variables",
      "📁 Visit /files to check file system",
      "🗄️ Visit /database to test database connection",
      "📄 Visit /logs to check log files",
    ],
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
}

function handleTest(req, res) {
  const tests = [];

  // Test 1: File System
  try {
    const files = fs.readdirSync(".");
    tests.push({
      name: "File System Access",
      status: "PASS",
      result: `Found ${files.length} files/folders`,
      details: files.slice(0, 10), // Show first 10 items
    });
  } catch (error) {
    tests.push({
      name: "File System Access",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 2: Package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    tests.push({
      name: "Package.json",
      status: "PASS",
      result: `Found package: ${packageJson.name} v${packageJson.version}`,
    });
  } catch (error) {
    tests.push({
      name: "Package.json",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 3: Node Modules
  try {
    const nodeModulesExists = fs.existsSync("node_modules");
    if (nodeModulesExists) {
      const modules = fs.readdirSync("node_modules");
      tests.push({
        name: "Node Modules",
        status: "PASS",
        result: `Found ${modules.length} modules`,
      });
    } else {
      tests.push({
        name: "Node Modules",
        status: "FAIL",
        error: "node_modules directory not found - run npm install",
      });
    }
  } catch (error) {
    tests.push({
      name: "Node Modules",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 4: Environment File
  try {
    const envExists = fs.existsSync(".env");
    if (envExists) {
      const envContent = fs.readFileSync(".env", "utf8");
      const envLines = envContent
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));
      tests.push({
        name: "Environment File",
        status: "PASS",
        result: `Found .env with ${envLines.length} variables`,
      });
    } else {
      tests.push({
        name: "Environment File",
        status: "WARN",
        error: ".env file not found",
      });
    }
  } catch (error) {
    tests.push({
      name: "Environment File",
      status: "FAIL",
      error: error.message,
    });
  }

  // Test 5: Critical Dependencies
  const criticalDeps = ["express", "node-telegram-bot-api", "mysql2"];
  criticalDeps.forEach((dep) => {
    try {
      require.resolve(dep);
      tests.push({
        name: `Dependency: ${dep}`,
        status: "PASS",
        result: "Module can be loaded",
      });
    } catch (error) {
      tests.push({
        name: `Dependency: ${dep}`,
        status: "FAIL",
        error: "Module not found - run npm install",
      });
    }
  });

  const response = {
    status: "Test Results",
    timestamp: new Date().toISOString(),
    summary: {
      total: tests.length,
      passed: tests.filter((t) => t.status === "PASS").length,
      failed: tests.filter((t) => t.status === "FAIL").length,
      warnings: tests.filter((t) => t.status === "WARN").length,
    },
    tests: tests,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
}

function handleEnv(req, res) {
  const envVars = {
    system: {
      NODE_VERSION: process.version,
      PLATFORM: process.platform,
      ARCH: process.arch,
      CWD: process.cwd(),
      UPTIME: Math.floor(process.uptime()),
    },
    important: {},
    all: {},
  };

  // Important environment variables
  const importantVars = [
    "NODE_ENV",
    "PORT",
    "BOT_TOKEN",
    "ADMIN_USER_ID",
    "BOT_BASE_URL",
    "CPANEL_DOMAIN",
    "BOT_PATH",
    "DB_HOST",
    "DB_USER",
    "DB_NAME",
    "DB_PASSWORD",
  ];

  importantVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      // Hide sensitive values
      const isSensitive =
        varName.includes("TOKEN") || varName.includes("PASSWORD");
      envVars.important[varName] = isSensitive ? "***HIDDEN***" : value;
    } else {
      envVars.important[varName] = "NOT SET";
    }
  });

  // All environment variables (non-sensitive)
  Object.keys(process.env).forEach((key) => {
    const isSensitive =
      key.includes("TOKEN") ||
      key.includes("PASSWORD") ||
      key.includes("SECRET");
    if (!isSensitive) {
      envVars.all[key] = process.env[key];
    } else {
      envVars.all[key] = "***HIDDEN***";
    }
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(envVars, null, 2));
}

function handleFiles(req, res) {
  const fileInfo = {
    currentDirectory: process.cwd(),
    files: [],
    directories: [],
    important: {},
  };

  try {
    const items = fs.readdirSync(".");

    items.forEach((item) => {
      try {
        const stats = fs.statSync(item);
        const info = {
          name: item,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          permissions: stats.mode.toString(8),
        };

        if (stats.isDirectory()) {
          fileInfo.directories.push(info);
        } else {
          fileInfo.files.push(info);
        }
      } catch (error) {
        // Skip files we can't read
      }
    });

    // Check important files
    const importantFiles = [
      "package.json",
      "app.js",
      "config.js",
      "database.js",
      ".env",
      "src/bot/StudentResultsBot.js",
    ];

    importantFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          fileInfo.important[file] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          };
        } else {
          fileInfo.important[file] = { exists: false };
        }
      } catch (error) {
        fileInfo.important[file] = { exists: false, error: error.message };
      }
    });
  } catch (error) {
    fileInfo.error = error.message;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(fileInfo, null, 2));
}

function handleDatabase(req, res) {
  const dbTest = {
    timestamp: new Date().toISOString(),
    config: {
      host: process.env.DB_HOST || "not set",
      user: process.env.DB_USER || "not set",
      database: process.env.DB_NAME || "not set",
      password: process.env.DB_PASSWORD ? "set" : "not set",
    },
    tests: [],
  };

  try {
    // Test if mysql2 is available
    const mysql = require("mysql2");
    dbTest.tests.push({
      name: "MySQL2 Module",
      status: "PASS",
      result: "Module loaded successfully",
    });

    // Test database connection (if credentials are set)
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
      try {
        const connection = mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          timeout: 5000,
        });

        dbTest.tests.push({
          name: "Database Connection",
          status: "TESTING",
          result: "Connection created (actual test requires async operation)",
        });

        connection.end();
      } catch (error) {
        dbTest.tests.push({
          name: "Database Connection",
          status: "FAIL",
          error: error.message,
        });
      }
    } else {
      dbTest.tests.push({
        name: "Database Connection",
        status: "SKIP",
        result: "Database credentials not configured",
      });
    }
  } catch (error) {
    dbTest.tests.push({
      name: "MySQL2 Module",
      status: "FAIL",
      error: error.message,
    });
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(dbTest, null, 2));
}

function handleLogs(req, res) {
  const logInfo = {
    timestamp: new Date().toISOString(),
    logsDirectory: "./logs",
    files: {},
  };

  try {
    // Check if logs directory exists
    if (fs.existsSync("./logs")) {
      const logFiles = fs.readdirSync("./logs");

      logFiles.forEach((file) => {
        try {
          const filePath = path.join("./logs", file);
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf8");

          logInfo.files[file] = {
            size: stats.size,
            modified: stats.mtime.toISOString(),
            lines: content.split("\n").length,
            lastLines: content
              .split("\n")
              .slice(-5)
              .filter((line) => line.trim()),
          };
        } catch (error) {
          logInfo.files[file] = { error: error.message };
        }
      });
    } else {
      logInfo.error =
        "Logs directory does not exist - run: node create-logs.js";
    }
  } catch (error) {
    logInfo.error = error.message;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(logInfo, null, 2));
}

function handle404(req, res) {
  const response = {
    error: "Not Found",
    message: "The requested endpoint was not found",
    url: req.url,
    availableEndpoints: [
      `${BASE_PATH}/`,
      `${BASE_PATH}/test`,
      `${BASE_PATH}/env`,
      `${BASE_PATH}/files`,
      `${BASE_PATH}/database`,
      `${BASE_PATH}/logs`,
    ],
  };

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
}

function handleError(req, res, error) {
  console.error("Server Error:", error);

  const response = {
    error: "Internal Server Error",
    message: error.message,
    timestamp: new Date().toISOString(),
    url: req.url,
  };

  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify(response, null, 2));
}

// Start server
server.listen(PORT, () => {
  console.log("🚀 cPanel Test Server Started Successfully!");
  console.log("==========================================");
  console.log(`Port: ${PORT}`);
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log(`Process ID: ${process.pid}`);
  console.log("");
  console.log("🌐 Test URLs:");
  console.log(`Home: http://checkresultbot.abdiko.com${BASE_PATH}`);
  console.log(`Test: http://checkresultbot.abdiko.com${BASE_PATH}/test`);
  console.log(`Environment: http://checkresultbot.abdiko.com${BASE_PATH}/env`);
  console.log(`Files: http://checkresultbot.abdiko.com${BASE_PATH}/files`);
  console.log(
    `Database: http://checkresultbot.abdiko.com${BASE_PATH}/database`,
  );
  console.log(`Logs: http://checkresultbot.abdiko.com${BASE_PATH}/logs`);
  console.log("");
  console.log("✅ Server is ready for testing!");
});

// Error handling
server.on("error", (error) => {
  console.error("❌ Server Error:", error.message);

  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
  } else if (error.code === "EACCES") {
    console.error(`Permission denied for port ${PORT}`);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Shutting down test server...");
  server.close(() => {
    console.log("👋 Test server stopped");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🔄 Shutting down test server...");
  server.close(() => {
    console.log("👋 Test server stopped");
    process.exit(0);
  });
});

console.log("🔧 cPanel Connection Test Server");
console.log("================================");
console.log("Starting server...");

module.exports = server;
