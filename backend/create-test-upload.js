const XLSX = require("xlsx");
const path = require("path");

// Create test data with the exact format you're using (without PROJECT column)
const testData = [
  [
    "STUDENT NAME",
    "STUDENT ID",
    "QUIZ(5%)",
    "MID(30%)",
    "ASSIGNMENT(15%)",
    "FINAL(50%)",
    "TOTAL",
    "GRADE",
  ],
  ["Test Student 1", "TEST001", 4, 25, 12, 42, 83, "A-"],
  ["Test Student 2", "TEST002", 5, 28, 14, 45, 92, "A+"],
  ["Test Student 3", "TEST003", 3, 22, 10, 38, 73, "B+"],
];

function createTestFile() {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test_Results");

    const filePath = path.join(
      __dirname,
      "uploads",
      "test_upload_no_project.xlsx",
    );
    XLSX.writeFile(workbook, filePath);

    console.log("✅ Test upload file created successfully!");
    console.log("📁 File: uploads/test_upload_no_project.xlsx");
    console.log("\n📋 Columns included:");
    console.log("   - STUDENT NAME");
    console.log("   - STUDENT ID");
    console.log("   - QUIZ(5%)");
    console.log("   - MID(30%)");
    console.log("   - ASSIGNMENT(15%)");
    console.log("   - FINAL(50%)");
    console.log("   - TOTAL");
    console.log("   - GRADE");
    console.log(
      "\n⚠️  Note: PROJECT(20%) column is missing - this should still work",
    );
  } catch (error) {
    console.error("❌ Error creating test file:", error.message);
  }
}

createTestFile();
