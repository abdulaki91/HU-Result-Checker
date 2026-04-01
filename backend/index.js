const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import database
const { testConnection, syncDatabase } = require("./models");

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resultRoutes = require("./routes/resultRoutes");
const columnSettingsRoutes = require("./routes/columnSettingsRoutes");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { authenticateToken } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging - only in development and only for errors
if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("combined", {
      skip: function (req, res) {
        return res.statusCode < 400; // Only log errors (4xx and 5xx)
      },
    }),
  );
}

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: "MySQL",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/column-settings", columnSettingsRoutes);

// Serve React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection - REQUIRED
    await testConnection();

    // Sync database models
    await syncDatabase();
    console.log("🗄️  Database: MySQL (Connected)");

    // Start server only after successful database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      );
      console.log(
        `🔗 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    console.error("💡 Please check your database connection and try again");
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  const { sequelize } = require("./models");
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
