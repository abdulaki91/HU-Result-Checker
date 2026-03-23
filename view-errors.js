#!/usr/bin/env node

/**
 * View Error Logs Script
 *
 * Simple script to view error logs on cPanel
 */

const fs = require("fs");
const path = require("path");

function viewLogs() {
  console.log("📄 Viewing Error Logs\n");
  console.log("=".repeat(50));

  const logFiles = [
    { name: "errors.log", description: "Error Messages" },
    { name: "app.log", description: "Application Logs" },
    { name: "cpanel-issues.log", description: "cPanel Issues" },
    { name: "diagnostics.log", description: "Diagnostics" },
  ];

  let hasLogs = false;

  logFiles.forEach(({ name, description }) => {
    const filePath = `./logs/${name}`;

    console.log(`\n📋 ${description} (${name})`);
    console.log("-".repeat(30));

    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        const stats = fs.statSync(filePath);

        console.log(`File size: ${stats.size} bytes`);
        console.log(`Last modified: ${stats.mtime.toISOString()}`);

        if (content.trim()) {
          hasLogs = true;
          console.log("\nContent:");

          // Show last 10 lines or 1000 characters, whichever is less
          const lines = content.split("\n");
          const lastLines = lines.slice(-10).join("\n");
          const displayContent =
            lastLines.length > 1000
              ? lastLines.substring(lastLines.length - 1000)
              : lastLines;

          console.log(displayContent);

          if (lines.length > 10) {
            console.log(
              `\n... (showing last 10 lines of ${lines.length} total lines)`,
            );
          }
        } else {
          console.log("File is empty");
        }
      } else {
        console.log("File does not exist");
      }
    } catch (error) {
      console.error(`❌ Error reading ${name}: ${error.message}`);
    }
  });

  if (!hasLogs) {
    console.log("\n⚠️  No logs found or all log files are empty");
    console.log("\n💡 To generate logs:");
    console.log("1. Run: node create-logs.js (to create log files)");
    console.log("2. Use: node app-with-logging.js (instead of app.js)");
    console.log("3. Try to access your bot or trigger errors");
    console.log("4. Run this script again to view logs");
  }

  // Check if logs directory exists
  if (!fs.existsSync("./logs")) {
    console.log("\n❌ Logs directory does not exist");
    console.log("Run: node create-logs.js to create it");
  }
}

function showRecentErrors() {
  console.log("\n🔍 Recent Errors Only\n");
  console.log("=".repeat(30));

  const errorFile = "./logs/errors.log";

  try {
    if (fs.existsSync(errorFile)) {
      const content = fs.readFileSync(errorFile, "utf8");
      const lines = content.split("\n").filter((line) => line.trim());

      // Filter for actual error entries (not comments)
      const errorLines = lines.filter(
        (line) =>
          line.includes("ERROR") ||
          line.includes("❌") ||
          line.includes('"level":"ERROR"') ||
          line.includes('"level":"error"'),
      );

      if (errorLines.length > 0) {
        console.log(`Found ${errorLines.length} error entries:\n`);

        // Show last 5 errors
        const recentErrors = errorLines.slice(-5);
        recentErrors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
          console.log("-".repeat(50));
        });
      } else {
        console.log("✅ No errors found in log file");
      }
    } else {
      console.log("❌ Error log file does not exist");
    }
  } catch (error) {
    console.error("❌ Failed to read error log:", error.message);
  }
}

function checkSystemInfo() {
  console.log("\n🖥️  System Information\n");
  console.log("=".repeat(25));

  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Current Directory: ${process.cwd()}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`Uptime: ${Math.floor(process.uptime())} seconds`);

  const memory = process.memoryUsage();
  console.log(`Memory Usage:`);
  console.log(`  RSS: ${Math.round(memory.rss / 1024 / 1024)} MB`);
  console.log(`  Heap Used: ${Math.round(memory.heapUsed / 1024 / 1024)} MB`);
  console.log(`  Heap Total: ${Math.round(memory.heapTotal / 1024 / 1024)} MB`);

  // Check environment variables
  console.log("\nEnvironment Variables:");
  const importantVars = [
    "NODE_ENV",
    "PORT",
    "BOT_TOKEN",
    "ADMIN_USER_ID",
    "DB_HOST",
  ];
  importantVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      // Hide sensitive values
      const displayValue =
        varName.includes("TOKEN") || varName.includes("PASSWORD")
          ? "***HIDDEN***"
          : value;
      console.log(`  ${varName}: ${displayValue}`);
    } else {
      console.log(`  ${varName}: NOT SET`);
    }
  });
}

// Main execution
console.log("🔍 Error Log Viewer for cPanel\n");

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes("--errors-only")) {
  showRecentErrors();
} else if (args.includes("--system")) {
  checkSystemInfo();
} else if (args.includes("--help")) {
  console.log("Usage: node view-errors.js [options]\n");
  console.log("Options:");
  console.log("  --errors-only    Show only error entries");
  console.log("  --system         Show system information");
  console.log("  --help           Show this help message");
  console.log("  (no options)     Show all logs");
} else {
  viewLogs();
  showRecentErrors();
  checkSystemInfo();
}

console.log("\n💡 Tips:");
console.log("=========");
console.log("• Run with --errors-only to see just errors");
console.log("• Run with --system to see system info");
console.log("• Use cPanel File Manager to download log files");
console.log(
  "• In cPanel Terminal: tail -f logs/errors.log for real-time monitoring",
);
