const XLSX = require("xlsx");
const path = require("path");

// Create sample data with flexible student ID formats
const flexibleResultsData = [
  [
    "STUDENT NAME",
    "STUDENT ID",
    "QUIZ(5%)",
    "MID(30%)",
    "ASSIGNMENT(15%)",
    "PROJECT(20%)",
    "FINAL(50%)",
    "TOTAL",
    "GRADE",
  ],
  ["John Doe", "CS2023001", 4, 25, 12, 18, 42, 101, "A+"],
  ["Jane Smith", "CS-2023-002", 3, 22, 10, 15, 35, 85, "A"],
  ["Bob Johnson", "CS--2023--003", 5, 28, 14, 20, 45, 112, "A+"],
  ["Alice Brown", "UGPR0742/15", 2, 18, 8, 12, 30, 70, "B"],
  ["Charlie Wilson", "BBA.2023.005", 4, 24, 11, 16, 38, 93, "A+"],
  ["Diana Prince", "IT 2023 006", 3, 20, 9, 14, 36, 82, "A-"],
  ["Edward King", "ENG--2023--007", 5, 26, 13, 19, 40, 103, "A+"],
  ["Fiona Green", "MATH.2023-008", 2, 16, 7, 11, 28, 64, "C+"],
  ["George White", "PHY 2023/009", 4, 23, 12, 17, 39, 95, "A+"],
  ["Helen Black", "CHEM-2023.010", 3, 21, 10, 15, 37, 86, "A"],
];

function createFlexibleSample() {
  try {
    // Create workbook with flexible student IDs
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(flexibleResultsData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flexible_IDs_Test");

    const filePath = path.join(
      __dirname,
      "uploads",
      "sample_flexible_ids.xlsx",
    );
    XLSX.writeFile(workbook, filePath);

    console.log("✅ Flexible student ID sample created successfully!");
    console.log("📁 File: uploads/sample_flexible_ids.xlsx");
    console.log("\n📋 Student ID formats included:");
    console.log("   - CS2023001 (standard)");
    console.log("   - CS-2023-002 (single dashes)");
    console.log("   - CS--2023--003 (double dashes)");
    console.log("   - UGPR0742/15 (with slash)");
    console.log("   - BBA.2023.005 (with dots)");
    console.log("   - IT 2023 006 (with spaces)");
    console.log("   - ENG--2023--007 (double dashes)");
    console.log("   - MATH.2023-008 (mixed dots and dashes)");
    console.log("   - PHY 2023/009 (mixed spaces and slash)");
    console.log("   - CHEM-2023.010 (mixed dashes and dots)");
  } catch (error) {
    console.error("❌ Error creating flexible sample:", error.message);
  }
}

createFlexibleSample();
