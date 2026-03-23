// Debug script to check project column visibility
const { Database } = require("./database");
const ExcelService = require("./excelService");

async function debugProject() {
  console.log("🔍 Debugging Project Column Visibility");

  const database = new Database();
  const excelService = new ExcelService();

  try {
    await database.initialize();

    // Check column settings
    console.log("\n📋 Column Settings:");
    const columnSettings = await database.getColumnSettings();
    console.log(columnSettings);

    // Check available columns
    console.log("\n📊 Available Columns:");
    const availableColumns = await database.getAvailableColumns();
    console.log(availableColumns);

    // Test with a sample student (if any exist)
    console.log("\n👤 Testing with sample student:");
    const studentCount = await database.getStudentCount();
    console.log(`Total students: ${studentCount}`);

    if (studentCount > 0) {
      // Try to find any student to test formatting
      const testStudent = {
        studentName: "Test Student",
        studentId: "TEST001",
        quiz: 85,
        mid: 78,
        assignment: 92,
        groupAssignment: 88,
        project: 95,
        final: 82,
        total: 87.5,
        grade: "B+",
      };

      console.log("\n🎓 Test Student Data:");
      console.log(testStudent);

      console.log("\n📝 Formatted Result:");
      const formattedResult = await excelService.formatStudentResult(
        testStudent,
        database,
      );
      console.log(formattedResult);
    }
  } catch (error) {
    console.error("❌ Debug error:", error.message);
  } finally {
    await database.close();
  }
}

debugProject();
