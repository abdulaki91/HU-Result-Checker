// Quick test to check project display
const ExcelService = require("./excelService");

async function testProjectDisplay() {
  const excelService = new ExcelService();

  // Test student with project data
  const testStudent = {
    studentName: "John Doe",
    studentId: "GPR0015/15",
    quiz: 85,
    mid: 78,
    assignment: 92,
    groupAssignment: 88,
    project: 95,
    final: 82,
    total: 87.5,
    grade: "B+",
  };

  console.log("🧪 Test Student Data:");
  console.log(JSON.stringify(testStudent, null, 2));

  // Test without database (should use defaults)
  console.log("\n📝 Formatted Result (without database):");
  const result1 = await excelService.formatStudentResult(testStudent);
  console.log(result1);

  // Test with null values
  const testStudentWithNulls = {
    ...testStudent,
    groupAssignment: null,
    project: null,
  };

  console.log("\n📝 Formatted Result (with null values):");
  const result2 = await excelService.formatStudentResult(testStudentWithNulls);
  console.log(result2);

  // Test with undefined values
  const testStudentWithUndefined = {
    ...testStudent,
    groupAssignment: undefined,
    project: undefined,
  };

  console.log("\n📝 Formatted Result (with undefined values):");
  const result3 = await excelService.formatStudentResult(
    testStudentWithUndefined,
  );
  console.log(result3);
}

testProjectDisplay().catch(console.error);
