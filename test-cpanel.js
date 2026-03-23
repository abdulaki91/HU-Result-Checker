// Simple test file for cPanel Node.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Node.js is working on cPanel!",
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env,
    cwd: process.cwd(),
    files: require("fs").readdirSync("."),
  });
});

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Current directory: ${process.cwd()}`);
});

// Handle errors
server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

module.exports = app;
