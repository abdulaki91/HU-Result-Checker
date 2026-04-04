const { User } = require("../models");
const { testConnection } = require("../models");

async function checkAdminUser() {
  try {
    // Test database connection
    await testConnection();
    console.log("✅ Database connected successfully");

    // Check for admin users
    const adminUsers = await User.findAll({
      where: { role: "admin", isActive: true },
    });

    console.log(`\n📊 Found ${adminUsers.length} active admin user(s):`);

    if (adminUsers.length === 0) {
      console.log("❌ No admin users found!");
      console.log("\n🔧 Creating default admin user...");

      const adminUser = await User.create({
        username: "admin",
        email: "admin@example.com",
        password: "admin123",
        fullName: "System Administrator",
        role: "admin",
        department: "IT",
      });

      console.log("✅ Default admin user created:");
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: admin123`);
    } else {
      adminUsers.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.username} (${user.email}) - ${user.fullName}`,
        );
        console.log(`      Login attempts: ${user.loginAttempts}`);
        console.log(`      Locked until: ${user.lockUntil || "Not locked"}`);
        console.log(`      Last login: ${user.lastLogin || "Never"}`);
      });
    }

    // Test login with demo credentials
    console.log("\n🔍 Testing login with demo credentials...");
    try {
      const testUser = await User.findByCredentials("admin", "admin123");
      console.log("✅ Demo login test successful");
      console.log(`   User: ${testUser.username} (${testUser.fullName})`);
    } catch (error) {
      console.log("❌ Demo login test failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    process.exit(0);
  }
}

checkAdminUser();
