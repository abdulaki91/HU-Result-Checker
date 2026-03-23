#!/usr/bin/env node

/**
 * Create Logs Directory and Test Error Logging
 */

const fs = require('fs');
const path = require('path');

function createLogsDirectory() {
  const logsDir = './logs';
  
  try {
    // Create logs directory
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('✅ Created logs directory');
    } else {
      console.log('📁 Logs directory already exists');
    }

    // Create initial log files
    const logFiles = [
      'errors.log',
      'app.log',
      'cpanel-issues.log',
      'diagnostics.log'
    ];

    logFiles.forEach(file => {
      const filePath = path.join(logsDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `# ${file} - Created ${new Date().toISOString()}\n`);
        console.log(`✅ Created ${file}`);
      } else {
        console.log(`📄 ${file} already exists`);
      }
    });

    // Set permissions (if on Unix-like system)
    try {
      fs.chmodSync(logsDir, 0o755);
      logFiles.forEach(file => {
        fs.chmodSync(path.join(logsDir, file), 0o644);
      });
      console.log('✅ Set file permissions');
    } catch (error) {
      console.log('⚠️  Could not set permissions (may not be needed on Windows/cPanel)');
    }

    // Test writing to log files
    const testMessage = `Test log entry - ${new Date().toISOString()}\n`;
    
    logFiles.forEach(file => {
      try {
        fs.appendFileSync(path.join(logsDir, file), testMessage);
        console.log(`✅ Successfully wrote to ${file}`);
      } catch (error) {
        console.error(`❌ Failed to write to ${file}:`, error.message);
      }
    });

    console.log('\n📋 Log Files Created:');
    console.log('=====================');
    logFiles.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`${file}: ${stats.size} bytes, modified: ${stats.mtime.toISOString()}`);
    });

    return true;

  } catch (error) {
    console.error('❌ Failed to create logs directory:', error.message);
    return false;
  }
}

function testErrorLogging() {
  console.log('\n🧪 Testing Error Logging...');
  
  try {
    const ErrorLogger = require('./src/utils/errorLogger');
    const errorLogger = new ErrorLogger();
    
    // Test different types of logs
    errorLogger.info('Test info message', { test: true });
    errorLogger.warn('Test warning message', { test: true });
    errorLogger.error('Test error message', new Error('This is a test error'), { test: true });
    
    console.log('✅ Error logging test completed');
    
  } catch (error) {
    console.error('❌ Error logging test failed:', error.message);
    
    // Fallback: write directly to file
    const logEntry = `[${new Date().toISOString()}] ERROR: Error logging test failed: ${error.message}\n`;
    fs.appendFileSync('./logs/errors.log', logEntry);
    console.log('✅ Wrote error to log file directly');
  }
}

function showLogContents() {
  console.log('\n📄 Current Log Contents:');
  console.log('=========================');
  
  const logFiles = ['errors.log', 'app.log', 'cpanel-issues.log'];
  
  logFiles.forEach(file => {
    const filePath = `./logs/${file}`;
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n--- ${file} ---`);
        console.log(content.slice(-500)); // Show last 500 characters
      } else {
        console.log(`\n--- ${file} ---`);
        console.log('File does not exist');
      }
    } catch (error) {
      console.error(`❌ Could not read ${file}:`, error.message);
    }
  });
}

// Main execution
console.log('🔧 Setting up logging for cPanel...\n');

const success = createLogsDirectory();

if (success) {
  testErrorLogging();
  showLogContents();
  
  console.log('\n🎉 Logging setup complete!');
  console.log('\n📋 How to view logs on cPanel:');
  console.log('===============================');
  console.log('1. In cPanel File Manager, navigate to your bot folder');
  console.log('2. Look for the "logs" folder');
  console.log('3. Click on log files to view contents');
  console.log('4. Or use cPanel Terminal: cat logs/errors.log');
  console.log('5. For real-time monitoring: tail -f logs/errors.log');
  
  console.log('\n📄 Log Files:');
  console.log('- logs/errors.log - All error messages');
  console.log('- logs/app.log - General application logs');
  console.log('- logs/cpanel-issues.log - cPanel specific issues');
  console.log('- logs/diagnostics.log - Diagnostic information');
  
} else {
  console.log('❌ Failed to set up logging');
}

console.log('\n💡 Next Steps:');
console.log('===============');
console.log('1. Upload this script to cPanel');
console.log('2. Run: node create-logs.js');
console.log('3. Use app-with-logging.js instead of app.js for detailed logging');
console.log('4. Check logs folder for error files');