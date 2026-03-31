const { User } = require("./models");
require("dotenv").config();

async function unlockAdmin() {
  try {
    console.log("🔓 Unlocking admin account...");

    // Find admin user
    const admin = await User.findOne({
      where: {
        username: "admin",
      },
    });

    if (!admin) {
      console.log("❌ Admin user not found");
      return;
    }

    console.log(`📊 Current status:`);
    console.log(`   Login attempts: ${admin.loginAttempts}`);
    console.log(`   Lock until: ${admin.lockUntil}`);
    console.log(`   Is locked: ${admin.isLocked()}`);

    // Reset login attempts and unlock
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    console.log("✅ Admin account unlocked successfully!");
    console.log("🔑 You can now login with:");
    console.log("   Email: admin@studentresults.edu");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Failed to unlock admin:", error.message);
  } finally {
    process.exit(0);
  }
}

unlockAdmin();
