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

// Resolve client origins for CORS
const getAllowedOrigins = () => {
  const origins = [];

  // Add production URL if set
  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL);
  }

  // Add development URLs
  origins.push("http://localhost:5173");
  origins.push("http://localhost:3000");
  origins.push("http://127.0.0.1:5173");

  // Add any additional URLs from environment
  if (process.env.VITE_FRONTEND_URL) {
    origins.push(process.env.VITE_FRONTEND_URL);
  }
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    const { sequelize } = require("./models");
    await sequelize.authenticate();

    // Get user count
    const User = require("./models/User");
    const userCount = await User.count();
    const adminCount = await User.count({
      where: { role: "admin", isActive: true },
    });

    res.json({
      success: true,
      message: "Server is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: "connected",
        type: "MySQL",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        userCount,
        adminCount,
      },
      cors: {
        allowedOrigins: allowedOrigins,
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      success: false,
      message: "Server health check failed",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        status: "disconnected",
        error: error.message,
      },
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", authenticateToken, adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/column-settings", columnSettingsRoutes);

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
      console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
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
