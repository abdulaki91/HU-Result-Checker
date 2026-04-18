/**
 * Migration script to update the grade system
 * - Removes grade calculation logic dependency
 * - Updates existing courses with N/A grades where appropriate
 * - Ensures data consistency after removing grade calculation
 */

const { sequelize } = require("../config/database");
const { Student, Course } = require("../models/Student");

async function updateGradeSystem() {
  console.log("🔄 Starting grade system update...");

  try {
    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // 1. Update any courses that might have invalid grades
      console.log("📊 Checking for courses with invalid grades...");

      const coursesWithInvalidGrades = await Course.findAll({
        where: {
          grade: null,
        },
        transaction,
      });

      if (coursesWithInvalidGrades.length > 0) {
        console.log(
          `⚠️ Found ${coursesWithInvalidGrades.length} courses with null grades`,
        );

        // Update null grades to N/A
        await Course.update(
          { grade: "N/A", gradePoints: 0.0 },
          {
            where: { grade: null },
            transaction,
          },
        );

        console.log("✅ Updated null grades to N/A");
      }

      // 2. Recalculate GPA for all students based on uploaded grades only
      console.log("🧮 Recalculating GPAs based on uploaded grades...");

      const allStudents = await Student.findAll({
        include: [
          {
            model: Course,
            as: "courses",
          },
        ],
        transaction,
      });

      let updatedStudents = 0;
      for (const student of allStudents) {
        await student.calculateGPA();
        await student.save({ transaction });
        updatedStudents++;

        if (updatedStudents % 100 === 0) {
          console.log(
            `   📈 Updated ${updatedStudents}/${allStudents.length} students`,
          );
        }
      }

      console.log(`✅ Updated GPA for ${updatedStudents} students`);

      // 3. Add N/A to grade enum if not already present
      console.log("🔧 Updating database schema for N/A grades...");

      try {
        await sequelize.query(
          `
          ALTER TABLE courses 
          MODIFY COLUMN grade ENUM('A+','A','A-','B+','B','B-','C+','C','C-','D','Fx','F','I','W','N/A') 
          NOT NULL
        `,
          { transaction },
        );

        console.log("✅ Updated grade enum to include N/A");
      } catch (enumError) {
        console.log("ℹ️ Grade enum already includes N/A or update not needed");
      }

      // Commit transaction
      await transaction.commit();

      console.log("🎉 Grade system update completed successfully!");

      // Print summary
      console.log("\n📋 Summary:");
      console.log("- Grade calculation logic removed");
      console.log("- Grades must now be uploaded in Excel files");
      console.log("- Individual marks are stored for reference only");
      console.log("- GPA calculation now uses uploaded grades only");
      console.log("- N/A grade available for courses without grades");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("💥 Error updating grade system:", error);
    throw error;
  }
}

// Run the migration if called directly
if (require.main === module) {
  updateGradeSystem()
    .then(() => {
      console.log("✅ Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { updateGradeSystem };
