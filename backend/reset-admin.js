const { User } = require("./models");
require("dotenv").config();

async function resetAdmin() {
  try {
    console.log("🔄 Resetting admin account...");

    // Find all users with admin role or username 'admin'
    const adminUsers = await User.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { username: "admin" },
          { email: "admin@studentresults.edu" },
          { role: "admin" },
        ],
      },
    });

    console.log(`📊 Found ${adminUsers.length} admin user(s)`);

    for (const admin of adminUsers) {
      console.log(`\n👤 User: ${admin.username} (${admin.email})`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Login attempts: ${admin.loginAttempts}`);
      console.log(`   Lock until: ${admin.lockUntil}`);
      console.log(`   Is locked: ${admin.isLocked()}`);
    }

    // Delete existing admin users
    await User.destroy({
      where: {
        [require("sequelize").Op.or]: [
          { username: "admin" },
          { email: "admin@studentresults.edu" },
        ],
      },
    });

    console.log("\n🗑️  Removed existing admin users");

    // Create fresh admin user
    const newAdmin = await User.create({
      username: "admin",
      email: "admin@studentresults.edu",
      password: "admin123", // Will be hashed automatically
      fullName: "System Administrator",
      role: "admin",
      department: "IT",
      isActive: true,
      loginAttempts: 0,
      lockUntil: null,
    });

    console.log("\n✅ Created fresh admin user:");
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Active: ${newAdmin.isActive}`);

    console.log("\n🔑 Login credentials:");
    console.log("   Email: admin@studentresults.edu");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Failed to reset admin:", error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

resetAdmin();
