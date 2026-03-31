const { User } = require("./models");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function quickSeed() {
  try {
    console.log("🌱 Quick seeding admin user...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      username: "admin",
      email: "admin@studentresults.edu",
      password: "admin123", // Will be hashed by the model
      fullName: "System Administrator",
      role: "admin",
      department: "IT",
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Username:", adminUser.username);
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Quick seed failed:", error.message);
  }
}

quickSeed();
