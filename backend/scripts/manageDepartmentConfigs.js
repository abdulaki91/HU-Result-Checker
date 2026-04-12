const { sequelize } = require("../config/database");
const { Student, Course, AssessmentConfig } = require("../models");

/**
 * Script to manage department-specific assessment configurations
 * This ensures each department can have its own assessment weightings
 */

async function createDepartmentConfig(department, weights, description = null) {
  try {
    console.log(`🏢 Creating assessment config for ${department}...`);

    // Validate weights add up to 100
    const total =
      weights.quiz +
      weights.midterm +
      weights.assignment +
      weights.project +
      weights.final;
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(`Weights must add up to 100%. Current total: ${total}%`);
    }

    const configName = `dept-${department.toLowerCase().replace(/\s+/g, "-")}`;

    // Check if config already exists
    let config = await AssessmentConfig.findOne({
      where: { configName },
    });

    if (config) {
      console.log(`✅ Config already exists for ${department}: ${configName}`);
      return config;
    }

    // Create new config
    config = await AssessmentConfig.create({
      configName,
      description:
        description || `Assessment configuration for ${department} department`,
      quizWeight: weights.quiz,
      midtermWeight: weights.midterm,
      assignmentWeight: weights.assignment,
      projectWeight: weights.project,
      finalWeight: weights.final,
      quizMaxMarks: weights.quiz,
      midtermMaxMarks: weights.midterm,
      assignmentMaxMarks: weights.assignment,
      projectMaxMarks: weights.project,
      finalMaxMarks: weights.final,
      isActive: false, // Don't set as globally active
    });

    console.log(`✅ Created config for ${department}: ${configName}`);
    return config;
  } catch (error) {
    console.error(
      `❌ Failed to create config for ${department}:`,
      error.message,
    );
    throw error;
  }
}

async function linkStudentsToDepartmentConfig(department, configId) {
  try {
    console.log(`🔗 Linking ${department} students to config ${configId}...`);

    const [result] = await sequelize.query(
      `
      UPDATE students 
      SET assessmentConfigId = :configId 
      WHERE department = :department
    `,
      {
        replacements: { configId, department },
      },
    );

    console.log(
      `✅ Updated ${result.affectedRows || 0} students in ${department}`,
    );

    // Also update their courses
    const [courseResult] = await sequelize.query(
      `
      UPDATE courses c
      JOIN students s ON c.studentId = s.id
      SET c.assessmentConfigId = :configId 
      WHERE s.department = :department
    `,
      {
        replacements: { configId, department },
      },
    );

    console.log(
      `✅ Updated ${courseResult.affectedRows || 0} courses for ${department} students`,
    );

    return {
      studentsUpdated: result.affectedRows || 0,
      coursesUpdated: courseResult.affectedRows || 0,
    };
  } catch (error) {
    console.error(`❌ Failed to link ${department} students:`, error.message);
    throw error;
  }
}

async function setupDepartmentConfigs() {
  try {
    console.log(
      "🚀 Setting up department-specific assessment configurations...",
    );

    // Define department-specific configurations
    const departmentConfigs = [
      {
        department: "Computer Science",
        weights: {
          quiz: 10,
          midterm: 25,
          assignment: 15,
          project: 20,
          final: 30,
        },
        description:
          "CS department: Higher project weight for practical skills",
      },
      {
        department: "Information Technology",
        weights: {
          quiz: 5,
          midterm: 30,
          assignment: 10,
          project: 15,
          final: 40,
        },
        description:
          "IT department: Standard distribution with emphasis on final exam",
      },
      {
        department: "Software Engineering",
        weights: {
          quiz: 8,
          midterm: 22,
          assignment: 20,
          project: 25,
          final: 25,
        },
        description:
          "SE department: Balanced approach with high assignment and project weights",
      },
      {
        department: "Business Administration",
        weights: {
          quiz: 15,
          midterm: 30,
          assignment: 20,
          project: 10,
          final: 25,
        },
        description:
          "Business: Higher quiz and assignment weights for continuous assessment",
      },
      {
        department: "Engineering", // Generic for other engineering departments
        weights: {
          quiz: 5,
          midterm: 30,
          assignment: 10,
          project: 15,
          final: 40,
        },
        description:
          "Engineering departments: Traditional academic distribution",
      },
    ];

    const results = [];

    for (const deptConfig of departmentConfigs) {
      try {
        // Create the configuration
        const config = await createDepartmentConfig(
          deptConfig.department,
          deptConfig.weights,
          deptConfig.description,
        );

        // Link existing students to this configuration
        const linkResult = await linkStudentsToDepartmentConfig(
          deptConfig.department,
          config.id,
        );

        results.push({
          department: deptConfig.department,
          configId: config.id,
          configName: config.configName,
          ...linkResult,
        });
      } catch (error) {
        console.error(
          `❌ Failed to setup ${deptConfig.department}:`,
          error.message,
        );
        results.push({
          department: deptConfig.department,
          error: error.message,
        });
      }
    }

    console.log("\n📊 Setup Results:");
    results.forEach((result) => {
      if (result.error) {
        console.log(`❌ ${result.department}: ${result.error}`);
      } else {
        console.log(
          `✅ ${result.department}: Config ${result.configName}, ${result.studentsUpdated} students, ${result.coursesUpdated} courses`,
        );
      }
    });

    return results;
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    throw error;
  }
}

async function listDepartmentConfigs() {
  try {
    console.log("📋 Current Department Configurations:");

    const configs = await AssessmentConfig.findAll({
      order: [["configName", "ASC"]],
    });

    for (const config of configs) {
      // Count students using this config
      const studentCount = await Student.count({
        where: { assessmentConfigId: config.id },
      });

      console.log(`\n🏢 ${config.configName}`);
      console.log(`   Description: ${config.description}`);
      console.log(
        `   Weights: Quiz ${config.quizWeight}%, Midterm ${config.midtermWeight}%, Assignment ${config.assignmentWeight}%, Project ${config.projectWeight}%, Final ${config.finalWeight}%`,
      );
      console.log(`   Students using: ${studentCount}`);
      console.log(`   Active: ${config.isActive ? "Yes" : "No"}`);
    }
  } catch (error) {
    console.error("❌ Failed to list configs:", error.message);
    throw error;
  }
}

async function fixOrphanedStudents() {
  try {
    console.log("🔧 Fixing students without assessment configurations...");

    // Find students without assessment config
    const orphanedStudents = await Student.findAll({
      where: { assessmentConfigId: null },
      attributes: ["id", "studentId", "fullName", "department"],
    });

    console.log(
      `Found ${orphanedStudents.length} students without assessment config`,
    );

    for (const student of orphanedStudents) {
      // Try to find department-specific config
      const deptConfigName = `dept-${student.department.toLowerCase().replace(/\s+/g, "-")}`;
      let config = await AssessmentConfig.findOne({
        where: { configName: deptConfigName },
      });

      // If no department config, use default
      if (!config) {
        config = await AssessmentConfig.findOne({
          where: { configName: "default" },
        });
      }

      if (config) {
        await student.update({ assessmentConfigId: config.id });

        // Also update their courses
        await Course.update(
          { assessmentConfigId: config.id },
          { where: { studentId: student.id } },
        );

        console.log(
          `✅ Fixed ${student.studentId} (${student.department}) -> ${config.configName}`,
        );
      } else {
        console.log(
          `⚠️ No config found for ${student.studentId} (${student.department})`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Failed to fix orphaned students:", error.message);
    throw error;
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "setup":
        await setupDepartmentConfigs();
        break;
      case "list":
        await listDepartmentConfigs();
        break;
      case "fix":
        await fixOrphanedStudents();
        break;
      default:
        console.log(`
🏢 Department Assessment Configuration Manager

Usage: node manageDepartmentConfigs.js <command>

Commands:
  setup  - Create department-specific assessment configurations
  list   - List all current configurations and their usage
  fix    - Fix students without assessment configurations

Examples:
  node manageDepartmentConfigs.js setup
  node manageDepartmentConfigs.js list
  node manageDepartmentConfigs.js fix
        `);
    }
  } catch (error) {
    console.error("❌ Command failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("✅ Command completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Command failed:", error);
      process.exit(1);
    });
}

module.exports = {
  createDepartmentConfig,
  linkStudentsToDepartmentConfig,
  setupDepartmentConfigs,
  listDepartmentConfigs,
  fixOrphanedStudents,
};
