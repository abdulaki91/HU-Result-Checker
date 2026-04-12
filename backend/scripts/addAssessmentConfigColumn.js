/**
 * Migration Script: Add assessmentConfigId column to courses table
 * Run this script to add the new column for dynamic assessment configuration
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

async function addAssessmentConfigColumn() {
  try {
    console.log(
      "🔄 Starting migration: Add assessmentConfigId to courses table",
    );

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'courses' 
        AND COLUMN_NAME = 'assessmentConfigId'
    `);

    if (results.length > 0) {
      console.log(
        "✅ Column 'assessmentConfigId' already exists. No migration needed.",
      );
      process.exit(0);
    }

    // Add the column
    console.log("📝 Adding assessmentConfigId column to courses table...");
    await sequelize.query(`
      ALTER TABLE courses 
      ADD COLUMN assessmentConfigId INT NULL
    `);

    console.log("✅ Column added successfully");

    // Create assessment_configs table if it doesn't exist
    console.log("📝 Creating assessment_configs table if not exists...");
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS assessment_configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        configName VARCHAR(100) UNIQUE NOT NULL,
        description VARCHAR(255),
        quizWeight DECIMAL(5,2) DEFAULT 5.00 COMMENT 'Quiz weight as percentage',
        midtermWeight DECIMAL(5,2) DEFAULT 30.00 COMMENT 'Midterm weight as percentage',
        assignmentWeight DECIMAL(5,2) DEFAULT 10.00 COMMENT 'Assignment weight as percentage',
        projectWeight DECIMAL(5,2) DEFAULT 15.00 COMMENT 'Project weight as percentage',
        finalWeight DECIMAL(5,2) DEFAULT 40.00 COMMENT 'Final exam weight as percentage',
        quizMaxMarks DECIMAL(5,2) DEFAULT 5.00,
        midtermMaxMarks DECIMAL(5,2) DEFAULT 30.00,
        assignmentMaxMarks DECIMAL(5,2) DEFAULT 10.00,
        projectMaxMarks DECIMAL(5,2) DEFAULT 15.00,
        finalMaxMarks DECIMAL(5,2) DEFAULT 40.00,
        isActive BOOLEAN DEFAULT FALSE,
        createdBy INT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("✅ assessment_configs table created");

    // Check if default config exists
    const [configs] = await sequelize.query(`
      SELECT * FROM assessment_configs WHERE configName = 'default'
    `);

    if (configs.length === 0) {
      console.log("📝 Creating default assessment configuration...");
      await sequelize.query(`
        INSERT INTO assessment_configs (
          configName, description, isActive,
          quizWeight, midtermWeight, assignmentWeight, projectWeight, finalWeight,
          quizMaxMarks, midtermMaxMarks, assignmentMaxMarks, projectMaxMarks, finalMaxMarks
        ) VALUES (
          'default', 
          'Default assessment configuration (Quiz 5%, Midterm 30%, Assignment 10%, Project 15%, Final 40%)', 
          TRUE,
          5.00, 30.00, 10.00, 15.00, 40.00,
          5.00, 30.00, 10.00, 15.00, 40.00
        )
      `);
      console.log("✅ Default configuration created");
    } else {
      console.log("✅ Default configuration already exists");
    }

    // Add foreign key constraint
    console.log("📝 Adding foreign key constraint...");
    try {
      await sequelize.query(`
        ALTER TABLE courses 
        ADD CONSTRAINT fk_courses_assessment_config
        FOREIGN KEY (assessmentConfigId) 
        REFERENCES assessment_configs(id) 
        ON DELETE SET NULL
      `);
      console.log("✅ Foreign key constraint added");
    } catch (error) {
      if (error.message.includes("Duplicate")) {
        console.log("✅ Foreign key constraint already exists");
      } else {
        console.warn(
          "⚠️  Could not add foreign key constraint:",
          error.message,
        );
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   - Added assessmentConfigId column to courses table");
    console.log("   - Created assessment_configs table");
    console.log("   - Created default assessment configuration");
    console.log("   - Added foreign key constraint");
    console.log(
      "\n🎉 You can now upload Excel files with any mark distribution!",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("📍 Error details:", error);
    process.exit(1);
  }
}

// Run migration
addAssessmentConfigColumn();
