// Update existing students with default values for email, phone, and maxViews
const { sequelize } = require("../config/database");
const { Student } = require("../models/Student");

async function updateDefaultValues() {
  try {
    console.log("🔄 Starting database update for default values...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Update students with null or empty email
    const emailUpdateResult = await Student.update(
      { email: "N/A" },
      {
        where: {
          [sequelize.Sequelize.Op.or]: [{ email: null }, { email: "" }],
        },
      },
    );
    console.log(
      `✅ Updated ${emailUpdateResult[0]} students with default email (N/A)`,
    );

    // Update students with null or empty phone
    const phoneUpdateResult = await Student.update(
      { phone: "N/A" },
      {
        where: {
          [sequelize.Sequelize.Op.or]: [{ phone: null }, { phone: "" }],
        },
      },
    );
    console.log(
      `✅ Updated ${phoneUpdateResult[0]} students with default phone (N/A)`,
    );

    // Update students with maxViews = 10 to 6
    const maxViewsUpdateResult = await Student.update(
      { maxViews: 6 },
      {
        where: {
          maxViews: 10,
        },
      },
    );
    console.log(
      `✅ Updated ${maxViewsUpdateResult[0]} students with maxViews from 10 to 6`,
    );

    // Get summary
    const totalStudents = await Student.count();
    const studentsWithNA = await Student.count({
      where: {
        [sequelize.Sequelize.Op.or]: [{ email: "N/A" }, { phone: "N/A" }],
      },
    });

    console.log("\n📊 Summary:");
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Students with N/A values: ${studentsWithNA}`);
    console.log("\n✅ Database update completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database update failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

updateDefaultValues();
