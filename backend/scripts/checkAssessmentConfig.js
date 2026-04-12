/**
 * Check current assessment configuration status
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

async function checkAssessmentConfig() {
  try {
    console.log("🔍 Checking assessment configuration status...\n");

    // Check if table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'assessment_configs'
    `);

    if (tables.length === 0) {
      console.log("❌ assessment_configs table does NOT exist!");
      console.log("📝 Run: node scripts/addAssessmentConfigColumn.js");
      process.exit(1);
    }

    console.log("✅ assessment_configs table exists\n");

    // Check configurations
    const [configs] = await sequelize.query(`
      SELECT * FROM assessment_configs
    `);

    if (configs.length === 0) {
      console.log("⚠️  No assessment configurations found!");
      console.log("📝 Creating default configuration...\n");

      await sequelize.query(`
        INSERT INTO assessment_configs (
          configName, description, isActive,
          quizWeight, midtermWeight, assignmentWeight, projectWeight, finalWeight,
          quizMaxMarks, midtermMaxMarks, assignmentMaxMarks, projectMaxMarks, finalMaxMarks
        ) VALUES (
          'default', 
          'Default assessment configuration', 
          TRUE,
          5.00, 30.00, 10.00, 15.00, 40.00,
          5.00, 30.00, 10.00, 15.00, 40.00
        )
      `);

      console.log("✅ Default configuration created\n");
    }

    // Show all configurations
    const [allConfigs] = await sequelize.query(`
      SELECT * FROM assessment_configs ORDER BY isActive DESC, createdAt DESC
    `);

    console.log("📋 Assessment Configurations:\n");
    allConfigs.forEach((config, index) => {
      console.log(
        `${index + 1}. ${config.configName} ${config.isActive ? "(ACTIVE)" : ""}`,
      );
      console.log(`   Description: ${config.description || "N/A"}`);
      console.log(`   Weightings:`);
      console.log(
        `     - Quiz: ${config.quizWeight}% (max: ${config.quizMaxMarks})`,
      );
      console.log(
        `     - Midterm: ${config.midtermWeight}% (max: ${config.midtermMaxMarks})`,
      );
      console.log(
        `     - Assignment: ${config.assignmentWeight}% (max: ${config.assignmentMaxMarks})`,
      );
      console.log(
        `     - Project: ${config.projectWeight}% (max: ${config.projectMaxMarks})`,
      );
      console.log(
        `     - Final: ${config.finalWeight}% (max: ${config.finalMaxMarks})`,
      );
      console.log(`   Created: ${config.createdAt}`);
      console.log();
    });

    // Check column_settings
    const [columnSettings] = await sequelize.query(`
      SELECT columnKey, columnName FROM column_settings 
      WHERE columnKey IN ('quiz', 'midterm', 'assignment', 'project', 'final')
      ORDER BY displayOrder
    `);

    console.log("📋 Column Settings (marks columns):\n");
    columnSettings.forEach((col) => {
      console.log(`   ${col.columnKey}: "${col.columnName}"`);
    });

    console.log("\n✅ Diagnostic complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAssessmentConfig();
