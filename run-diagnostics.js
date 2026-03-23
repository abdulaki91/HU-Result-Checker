#!/usr/bin/env node

/**
 * Run Diagnostics Script
 *
 * This script runs comprehensive diagnostics and provides solutions
 */

const CPanelDiagnostics = require("./cpanel-diagnostics");
const ErrorLogger = require("./src/utils/errorLogger");

async function main() {
  console.log("🔍 Starting Comprehensive cPanel Diagnostics\n");
  console.log("This will help identify issues with your bot on cPanel\n");

  const errorLogger = new ErrorLogger();
  const diagnostics = new CPanelDiagnostics();

  try {
    // Clear old logs
    await errorLogger.clearLogs();
    console.log("✅ Cleared old log files\n");

    // Run diagnostics
    await diagnostics.runDiagnostics();

    // Generate error summary
    console.log("\n📊 Generating Error Summary...");
    await errorLogger.generateErrorSummary();

    console.log("\n🎯 NEXT STEPS FOR CPANEL:");
    console.log("==========================");
    console.log("1. Upload all files to cPanel public_html/telegram-bot/");
    console.log("2. In cPanel Node.js Apps:");
    console.log("   - Application Root: telegram-bot");
    console.log(
      "   - Startup File: app.js (or app-with-logging.js for detailed logs)",
    );
    console.log("   - Application Mode: Production");
    console.log("3. Add environment variables in cPanel Node.js App");
    console.log("4. Install dependencies: npm install");
    console.log("5. Start the application");
    console.log("6. Setup webhook: node setup-webhook-cpanel.js");
    console.log("7. Test: visit http://checkresultbot.abdiko.com/status");

    console.log("\n📄 LOG FILES CREATED:");
    console.log("======================");
    console.log("- ./logs/cpanel-diagnostics.log - Detailed diagnostics");
    console.log("- ./logs/cpanel-errors.log - Error log");
    console.log("- ./logs/diagnostic-report.json - Summary report");
    console.log("- ./logs/error-summary.json - Error analysis");

    console.log("\n💡 TROUBLESHOOTING TIPS:");
    console.log("=========================");
    console.log(
      "• If you see 404 errors: Check if Node.js app is running in cPanel",
    );
    console.log(
      '• If dependencies missing: Run "npm install" in cPanel Terminal',
    );
    console.log(
      "• If database errors: Verify DB credentials in environment variables",
    );
    console.log(
      "• If webhook fails: Ensure domain has SSL (HTTPS) or use polling mode",
    );
    console.log("• If bot not responding: Check bot token and admin user ID");

    console.log("\n🔧 CPANEL SPECIFIC CHECKS:");
    console.log("===========================");
    console.log("• Node.js version: Check if 14+ is available");
    console.log("• Resource limits: Monitor CPU/memory usage");
    console.log("• File permissions: Ensure 755 for folders, 644 for files");
    console.log("• Port configuration: Let cPanel assign ports automatically");
  } catch (error) {
    console.error("❌ Diagnostics failed:", error.message);
    await errorLogger.error("Diagnostics script failed", error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;
