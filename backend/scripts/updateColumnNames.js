/**
 * Update column names to remove hardcoded percentages
 * This allows dynamic display of assessment weightings
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

async function updateColumnNames() {
  try {
    console.log("🔄 Updating column names to remove hardcoded percentages...");

    // Update column names to remove percentages
    const updates = [
      { columnKey: "quiz", newName: "Quiz" },
      { columnKey: "midterm", newName: "Midterm" },
      { columnKey: "assignment", newName: "Assignment" },
      { columnKey: "project", newName: "Project" },
      { columnKey: "final", newName: "Final" },
    ];

    for (const update of updates) {
      await sequelize.query(`
        UPDATE column_settings 
        SET columnName = '${update.newName}' 
        WHERE columnKey = '${update.columnKey}'
      `);
      console.log(`✅ Updated ${update.columnKey} to "${update.newName}"`);
    }

    console.log("\n✅ All column names updated successfully!");
    console.log(
      "📋 Percentages will now be displayed dynamically based on assessment configuration",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Update failed:", error.message);
    console.error("📍 Error details:", error);
    process.exit(1);
  }
}

// Run update
updateColumnNames();
