const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { sequelize } = require("../config/database");

async function addViewerColumn() {
  try {
    console.log(
      "🔄 Adding viewerStudentId column to device_view_history table...",
    );

    // Add the new column
    await sequelize.query(`
      ALTER TABLE device_view_history 
      ADD COLUMN IF NOT EXISTS viewerStudentId VARCHAR(100) NULL 
      COMMENT 'Student ID of the person viewing (the searcher)'
      AFTER studentId
    `);

    console.log("✅ Column added successfully!");

    // Add index for the new column
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_viewer_student_id 
      ON device_view_history(viewerStudentId)
    `);

    console.log("✅ Index created successfully!");

    // Show table structure
    const [results] = await sequelize.query(`
      DESCRIBE device_view_history
    `);

    console.log("\n📋 Updated table structure:");
    console.table(results);

    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run the migration
addViewerColumn();
