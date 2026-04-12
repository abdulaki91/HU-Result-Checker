/**
 * Create a custom assessment configuration
 * Usage: node scripts/createCustomConfig.js <quiz> <midterm> <assignment> <project> <final>
 * Example: node scripts/createCustomConfig.js 10 20 15 15 40
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

async function createCustomConfig() {
  try {
    // Get weights from command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 5) {
      console.log("❌ Invalid arguments!");
      console.log(
        "\nUsage: node scripts/createCustomConfig.js <quiz> <midterm> <assignment> <project> <final>",
      );
      console.log("Example: node scripts/createCustomConfig.js 10 20 15 15 40");
      console.log("\nWeights must add up to 100%");
      process.exit(1);
    }

    const [quiz, midterm, assignment, project, final] = args.map(parseFloat);

    // Validate
    if (args.some(isNaN)) {
      console.log("❌ All arguments must be numbers!");
      process.exit(1);
    }

    const total = quiz + midterm + assignment + project + final;
    if (Math.abs(total - 100) > 0.01) {
      console.log(`❌ Weights must add up to 100%! Current total: ${total}%`);
      process.exit(1);
    }

    console.log("🔄 Creating custom assessment configuration...\n");
    console.log("Weightings:");
    console.log(`  - Quiz: ${quiz}%`);
    console.log(`  - Midterm: ${midterm}%`);
    console.log(`  - Assignment: ${assignment}%`);
    console.log(`  - Project: ${project}%`);
    console.log(`  - Final: ${final}%`);
    console.log(`  - Total: ${total}%\n`);

    const configName = `custom-${quiz}-${midterm}-${assignment}-${project}-${final}`;
    const description = `Custom configuration (Quiz ${quiz}%, Midterm ${midterm}%, Assignment ${assignment}%, Project ${project}%, Final ${final}%)`;

    // Check if already exists
    const [existing] = await sequelize.query(`
      SELECT * FROM assessment_configs WHERE configName = '${configName}'
    `);

    if (existing.length > 0) {
      console.log(`⚠️  Configuration "${configName}" already exists!`);
      console.log("📝 Activating it...\n");

      await sequelize.query(`
        UPDATE assessment_configs SET isActive = FALSE WHERE isActive = TRUE
      `);

      await sequelize.query(`
        UPDATE assessment_configs SET isActive = TRUE WHERE configName = '${configName}'
      `);

      console.log("✅ Configuration activated!");
    } else {
      console.log("📝 Creating new configuration...\n");

      // Deactivate all others
      await sequelize.query(`
        UPDATE assessment_configs SET isActive = FALSE WHERE isActive = TRUE
      `);

      // Create new
      await sequelize.query(`
        INSERT INTO assessment_configs (
          configName, description, isActive,
          quizWeight, midtermWeight, assignmentWeight, projectWeight, finalWeight,
          quizMaxMarks, midtermMaxMarks, assignmentMaxMarks, projectMaxMarks, finalMaxMarks
        ) VALUES (
          '${configName}',
          '${description}',
          TRUE,
          ${quiz}, ${midterm}, ${assignment}, ${project}, ${final},
          ${quiz}, ${midterm}, ${assignment}, ${project}, ${final}
        )
      `);

      console.log("✅ Configuration created and activated!");
    }

    // Show current active config
    const [active] = await sequelize.query(`
      SELECT * FROM assessment_configs WHERE isActive = TRUE
    `);

    console.log("\n📋 Active Configuration:");
    console.log(`   Name: ${active[0].configName}`);
    console.log(`   Description: ${active[0].description}`);
    console.log(`   Weightings:`);
    console.log(`     - Quiz: ${active[0].quizWeight}%`);
    console.log(`     - Midterm: ${active[0].midtermWeight}%`);
    console.log(`     - Assignment: ${active[0].assignmentWeight}%`);
    console.log(`     - Project: ${active[0].projectWeight}%`);
    console.log(`     - Final: ${active[0].finalWeight}%`);

    console.log("\n✅ Done! The UI will now show these percentages.");
    console.log("💡 Refresh the student result page to see the changes.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createCustomConfig();
