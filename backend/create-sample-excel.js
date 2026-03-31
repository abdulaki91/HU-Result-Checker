const XLSX = require("xlsx");
const path = require("path");

// Create sample data for the simple results format
const simpleResultsData = [
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
  ["Jane Smith", "CS2023002", 3, 22, 10, 15, 35, 85, "A"],
  ["Bob Johnson", "CS2023003", 5, 28, 14, 20, 45, 112, "A+"],
  ["Alice Brown", "CS2023004", 2, 18, 8, 12, 30, 70, "B"],
  ["Charlie Wilson", "CS2023005", 4, 24, 11, 16, 38, 93, "A+"],
];

// Create sample data for complete student format
const completeStudentData = [
  [
    "Full Name",
    "Student ID",
    "Department",
    "Batch",
    "Email",
    "Phone",
    "Course1_Code",
    "Course1_Name",
    "Course1_Grade",
    "Course2_Code",
    "Course2_Name",
    "Course2_Grade",
  ],
  [
    "John Doe",
    "CS2023001",
    "Computer Science",
    "2023",
    "john.doe@email.com",
    "+1234567890",
    "CS101",
    "Programming Fundamentals",
    "A+",
    "MATH201",
    "Calculus I",
    "A",
  ],
  [
    "Jane Smith",
    "CS2023002",
    "Computer Science",
    "2023",
    "jane.smith@email.com",
    "+1234567891",
    "CS101",
    "Programming Fundamentals",
    "A",
    "MATH201",
    "Calculus I",
    "B+",
  ],
  [
    "Bob Johnson",
    "IT2023001",
    "Information Technology",
    "2023",
    "bob.johnson@email.com",
    "+1234567892",
    "IT101",
    "IT Fundamentals",
    "A+",
    "ENG101",
    "English I",
    "A",
  ],
];

function createSampleExcelFiles() {
  try {
    // Create Simple Results Format
    const simpleWorkbook = XLSX.utils.book_new();
    const simpleWorksheet = XLSX.utils.aoa_to_sheet(simpleResultsData);
    XLSX.utils.book_append_sheet(
      simpleWorkbook,
      simpleWorksheet,
      "CS101_Results",
    );

    // Add another sheet for different course
    const mathResultsData = [
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
      ["John Doe", "CS2023001", 3, 20, 10, 15, 35, 83, "A-"],
      ["Jane Smith", "CS2023002", 4, 25, 12, 18, 40, 99, "A+"],
      ["Bob Johnson", "CS2023003", 2, 15, 8, 10, 25, 60, "C+"],
    ];
    const mathWorksheet = XLSX.utils.aoa_to_sheet(mathResultsData);
    XLSX.utils.book_append_sheet(
      simpleWorkbook,
      mathWorksheet,
      "MATH201_Results",
    );

    XLSX.writeFile(
      simpleWorkbook,
      path.join(__dirname, "uploads", "sample_simple_results.xlsx"),
    );

    // Create Complete Student Format
    const completeWorkbook = XLSX.utils.book_new();
    const completeWorksheet = XLSX.utils.aoa_to_sheet(completeStudentData);
    XLSX.utils.book_append_sheet(
      completeWorkbook,
      completeWorksheet,
      "Students",
    );

    XLSX.writeFile(
      completeWorkbook,
      path.join(__dirname, "uploads", "sample_complete_students.xlsx"),
    );

    console.log("✅ Sample Excel files created successfully!");
    console.log("📁 Files created:");
    console.log("   - uploads/sample_simple_results.xlsx");
    console.log("   - uploads/sample_complete_students.xlsx");
  } catch (error) {
    console.error("❌ Error creating sample files:", error.message);
  }
}

createSampleExcelFiles();
