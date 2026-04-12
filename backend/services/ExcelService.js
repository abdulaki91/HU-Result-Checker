const XLSX = require("xlsx");
const { Student, Course } = require("../models/Student");
const fs = require("fs");

class ExcelService {
  constructor() {
    this.requiredColumns = ["fullName", "studentId"]; // Only name and ID are truly required
    this.optionalColumns = [
      "department",
      "batch",
      "semester",
      "academicYear",
      "email",
      "phone",
      "status",
      // Direct marks columns for single-course format
      "quiz",
      "midterm",
      "assignment",
      "project",
      "final",
      "total",
      "grade",
    ];
    this.courseColumns = ["courseCode", "courseName", "creditHours", "grade"];
  }

  async parseAndImportStudents(filePath, uploadedBy) {
    try {
      console.log(`📁 Starting Excel import: ${filePath}`);
      console.log(`👤 Uploaded by user ID: ${uploadedBy}`);

      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        const error = "Excel file contains no sheets";
        console.error(`❌ Import failed: ${error}`);
        throw new Error(error);
      }

      console.log(
        `📊 Found ${sheetNames.length} sheet(s): ${sheetNames.join(", ")}`,
      );

      let totalProcessed = 0;
      let totalErrors = 0;
      const results = [];
      const errors = [];

      // Process each sheet (assuming each sheet is a different department/batch)
      for (const sheetName of sheetNames) {
        try {
          console.log(`\n🔄 Processing sheet: "${sheetName}"`);
          const sheetResult = await this.processSheet(
            workbook,
            sheetName,
            uploadedBy,
          );
          results.push({
            sheet: sheetName,
            ...sheetResult,
          });
          totalProcessed += sheetResult.processed;
          totalErrors += sheetResult.errors.length;

          console.log(
            `✅ Sheet "${sheetName}" completed: ${sheetResult.processed}/${sheetResult.total} processed, ${sheetResult.errors.length} errors`,
          );
        } catch (error) {
          console.error(`❌ Sheet "${sheetName}" failed:`, error.message);
          console.error(`📍 Stack trace:`, error.stack);
          errors.push({
            sheet: sheetName,
            error: error.message,
          });
          totalErrors++;
        }
      }

      console.log(`\n📈 Import Summary:`);
      console.log(`   - Total processed: ${totalProcessed}`);
      console.log(`   - Total errors: ${totalErrors}`);
      console.log(`   - Sheets processed: ${results.length}`);

      return {
        success: true,
        totalProcessed,
        totalErrors,
        sheets: results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(`💥 Critical import failure:`, error.message);
      console.error(`📍 Stack trace:`, error.stack);
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  async processSheet(workbook, sheetName, uploadedBy) {
    console.log(`  ⭐⭐⭐ PROCESSSHEET CALLED - NEW CODE VERSION ⭐⭐⭐`);
    console.log(`  📋 Reading sheet data...`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (jsonData.length < 2) {
      const error = `Sheet "${sheetName}" must contain at least a header row and one data row`;
      console.error(`  ❌ ${error}`);
      throw new Error(error);
    }

    // Smart header detection - look for the actual header row
    console.log(`  🔍 Detecting header row...`);
    let headerRowIndex = 0;
    let headerRow = null;

    // Check first 5 rows to find the one with student-related columns
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      console.log(`  📋 Checking row ${i + 1}: [${row.join(", ")}]`);

      // Count how many student-related columns this row has
      let studentColumnCount = 0;
      for (const cell of row) {
        if (!cell) continue;
        const normalized = this.normalizeColumnName(cell.toString().trim());
        if (this.isStudentRelatedColumn(normalized)) {
          studentColumnCount++;
        }
      }

      console.log(
        `  📊 Row ${i + 1} has ${studentColumnCount} student-related columns`,
      );

      // If this row has at least 2 student-related columns, it's likely the header
      if (studentColumnCount >= 2) {
        headerRowIndex = i;
        headerRow = row;
        console.log(`  ✅ Found header row at index ${i + 1}`);
        break;
      }
    }

    // If no header row found, fall back to first row
    if (!headerRow) {
      console.log(
        `  ⚠️ No clear header row found, using first row as fallback`,
      );
      headerRowIndex = 0;
      headerRow = jsonData[0];
    }

    // Get data rows (everything after the header row)
    const dataRows = jsonData.slice(headerRowIndex + 1);
    console.log(
      `  📊 Found ${dataRows.length} data rows (header at row ${headerRowIndex + 1})`,
    );
    console.log(`  📋 Headers: ${headerRow.join(", ")}`);

    const columnMapping = this.mapColumns(headerRow);
    console.log(`  🗺️ Column mapping:`, JSON.stringify(columnMapping, null, 2));

    // Validate required columns
    try {
      this.validateRequiredColumns(columnMapping, sheetName);
      console.log(`  ✅ Required columns validation passed`);
    } catch (validationError) {
      console.error(`  ❌ Column validation failed:`, validationError.message);
      throw validationError;
    }

    // Detect assessment configuration from first data row with marks
    console.log(`  🚀 CALLING detectAndCreateAssessmentConfig...`);
    await this.detectAndCreateAssessmentConfig(
      dataRows,
      columnMapping,
      sheetName,
    );
    console.log(`  ✅ detectAndCreateAssessmentConfig completed`);

    const students = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowIndex = headerRowIndex + i + 2; // Excel row number (1-indexed + header offset)

      try {
        console.log(`  🔄 Processing row ${rowIndex}:`, dataRows[i]);
        const studentData = this.processStudentRow(
          dataRows[i],
          columnMapping,
          sheetName,
        );
        if (studentData) {
          studentData.uploadedBy = uploadedBy;
          students.push(studentData);
          console.log(
            `  ✅ Row ${rowIndex} processed: ${studentData.fullName} (${studentData.studentId})`,
          );
        } else {
          console.log(`  ⚠️ Row ${rowIndex} skipped (empty row)`);
        }
      } catch (error) {
        console.error(`  ❌ Row ${rowIndex} failed:`, error.message);
        errors.push({
          row: rowIndex,
          error: error.message,
        });
      }
    }

    console.log(
      `  📊 Parsed ${students.length} students, ${errors.length} row errors`,
    );

    // Save students to database
    let processed = 0;
    const saveErrors = [];

    for (const studentData of students) {
      try {
        console.log(
          `  💾 Saving student: ${studentData.fullName} (${studentData.studentId})`,
        );
        await this.saveOrUpdateStudent(studentData);
        processed++;
        console.log(`  ✅ Saved: ${studentData.fullName}`);
      } catch (error) {
        console.error(
          `  ❌ Save failed for ${studentData.studentId}:`,
          error.message,
        );
        console.error(`  📍 Save error stack:`, error.stack);
        saveErrors.push({
          studentId: studentData.studentId,
          error: error.message,
        });
      }
    }

    console.log(
      `  📈 Sheet summary: ${processed}/${students.length} saved, ${saveErrors.length} save errors`,
    );

    return {
      processed,
      total: students.length,
      errors: [...errors, ...saveErrors],
    };
  }

  processStudentRow(row, columnMapping, sheetName) {
    // Skip empty rows
    if (!row || row.every((cell) => !cell || cell.toString().trim() === "")) {
      console.log(`    ⚠️ Skipping empty row`);
      return null;
    }

    const student = {};

    try {
      // Required fields
      student.fullName = this.getColumnValue(row, columnMapping.fullName);
      student.studentId = this.getColumnValue(row, columnMapping.studentId);

      console.log(
        `    👤 Processing: ${student.fullName} (${student.studentId})`,
      );

      // Department and batch can be optional if we're importing just course results
      student.department =
        this.getColumnValue(row, columnMapping.department) || "Other";
      student.batch =
        this.getColumnValue(row, columnMapping.batch) ||
        new Date().getFullYear().toString();

      // Validate required fields (only name and ID are truly required)
      if (!student.fullName || !student.studentId) {
        const error =
          "Missing required fields: Student Name and Student ID are mandatory";
        console.error(`    ❌ ${error}`);
        throw new Error(error);
      }

      // Clean and validate student ID
      student.studentId = student.studentId.toString().trim();
      // More flexible validation - allow letters, numbers, dashes, slashes, dots, spaces
      if (!/^[A-Za-z0-9\-\/\.\s]+$/.test(student.studentId)) {
        const error = `Invalid student ID format: ${student.studentId}`;
        console.error(`    ❌ ${error}`);
        throw new Error(error);
      }

      // Validate batch format (should be 4-digit year)
      student.batch = student.batch.toString().trim();
      if (!/^\d{4}$/.test(student.batch)) {
        const error = `Invalid batch format: ${student.batch}. Expected 4-digit year (e.g., 2023)`;
        console.error(`    ❌ ${error}`);
        throw new Error(error);
      }

      // Optional fields with defaults
      student.semester =
        this.getColumnValue(row, columnMapping.semester) || "Fall";
      student.academicYear =
        this.getColumnValue(row, columnMapping.academicYear) ||
        `${student.batch}-${parseInt(student.batch) + 1}`;
      student.email = this.getColumnValue(row, columnMapping.email) || "N/A";
      student.phone = this.getColumnValue(row, columnMapping.phone) || "N/A";
      student.status =
        this.getColumnValue(row, columnMapping.status) || "Active";

      // Validate email format if provided and not N/A
      if (
        student.email &&
        student.email !== "N/A" &&
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)
      ) {
        const error = `Invalid email format: ${student.email}`;
        console.error(`    ❌ ${error}`);
        throw new Error(error);
      }

      // Process courses - check for both multi-course and single-course formats
      console.log(`    📚 Processing courses...`);
      student.courses = this.processCourses(row, columnMapping);
      console.log(`    ✅ Found ${student.courses.length} course(s)`);

      return student;
    } catch (error) {
      console.error(`    💥 Student row processing failed:`, error.message);
      throw error;
    }
  }

  processCourses(row, columnMapping) {
    const courses = [];

    // Check for single-course format (direct marks columns)
    const hasSingleCourseFormat =
      columnMapping.quiz !== undefined ||
      columnMapping.midterm !== undefined ||
      columnMapping.assignment !== undefined ||
      columnMapping.project !== undefined ||
      columnMapping.final !== undefined ||
      columnMapping.total !== undefined ||
      columnMapping.grade !== undefined;

    console.log(
      `      📚 Course format detected: ${hasSingleCourseFormat ? "Single-course (marks)" : "Multi-course"}`,
    );

    if (hasSingleCourseFormat) {
      // Single course per row format
      const grade = this.getColumnValue(row, columnMapping.grade);
      const total = this.getNumericValue(row, columnMapping.total, 0);

      console.log(`      📊 Course data: grade="${grade}", total=${total}`);

      // Only create course if we have either grade or total marks
      if (grade || total > 0) {
        // Use sheet name or default as course code
        const courseCode =
          this.getColumnValue(row, columnMapping.courseCode) || "COURSE";
        const courseName =
          this.getColumnValue(row, columnMapping.courseName) || courseCode;

        // Get individual marks
        const quiz = this.getNumericValue(row, columnMapping.quiz, 0);
        const midterm = this.getNumericValue(row, columnMapping.midterm, 0);
        const assignment = this.getNumericValue(
          row,
          columnMapping.assignment,
          0,
        );
        const project = this.getNumericValue(row, columnMapping.project, 0);
        const final = this.getNumericValue(row, columnMapping.final, 0);

        console.log(
          `      📝 Individual marks: quiz=${quiz}, mid=${midterm}, assignment=${assignment}, project=${project}, final=${final}`,
        );

        // Calculate total if not provided but individual marks are available
        let calculatedTotal = total;
        if (!total || total === 0) {
          calculatedTotal = quiz + midterm + assignment + project + final;
          console.log(
            `      🧮 Calculated total: ${calculatedTotal} (from individual marks)`,
          );
        }

        // Calculate grade if not provided
        let finalGrade = grade;
        if (!finalGrade && calculatedTotal > 0) {
          finalGrade = Student.calculateGrade(calculatedTotal);
          console.log(
            `      🎯 Calculated grade: ${finalGrade} (from total: ${calculatedTotal})`,
          );
        }

        const course = {
          courseCode: courseCode.toString().trim().toUpperCase(),
          courseName: courseName || courseCode,
          creditHours: this.getNumericValue(row, columnMapping.creditHours, 3),
          grade: finalGrade ? finalGrade.toString().trim().toUpperCase() : "F",
          gradePoints: Student.getGradePoints(
            finalGrade ? finalGrade.toString().trim().toUpperCase() : "F",
          ),
          // Individual marks
          quizMarks: quiz,
          midtermMarks: midterm,
          assignmentMarks: assignment,
          projectMarks: project,
          finalMarks: final,
          totalMarks: calculatedTotal,
        };

        console.log(
          `      ✅ Course created: ${course.courseCode} (${course.grade}, ${course.totalMarks} marks)`,
        );
        courses.push(course);
      } else {
        console.log(
          `      ⚠️ No course created - no grade or total marks found`,
        );
      }
    } else {
      console.log(`      🔄 Processing multi-course format...`);
      // Multi-course format (existing logic)
      // Look for course columns (they might be numbered like course1_code, course1_name, etc.)
      const coursePattern = /^course(\d+)_(.+)$/;
      const courseGroups = {};

      // Group course columns by number
      Object.keys(columnMapping).forEach((key) => {
        const match = key.match(coursePattern);
        if (match) {
          const courseNum = match[1];
          const courseField = match[2];

          if (!courseGroups[courseNum]) {
            courseGroups[courseNum] = {};
          }
          courseGroups[courseNum][courseField] = columnMapping[key];
        }
      });

      console.log(
        `      📊 Found ${Object.keys(courseGroups).length} course groups`,
      );

      // Process each course group
      Object.keys(courseGroups).forEach((courseNum) => {
        const courseGroup = courseGroups[courseNum];
        console.log(`      🔄 Processing course ${courseNum}:`, courseGroup);

        const courseCode = this.getColumnValue(row, courseGroup.code);
        const courseName = this.getColumnValue(row, courseGroup.name);
        const creditHours = this.getNumericValue(row, courseGroup.credits, 3);
        const grade = this.getColumnValue(row, courseGroup.grade);

        // Only add course if we have at least code and grade
        if (courseCode && grade) {
          const course = {
            courseCode: courseCode.toString().trim().toUpperCase(),
            courseName: courseName || courseCode,
            creditHours: Math.max(1, Math.min(6, creditHours)), // Ensure 1-6 range
            grade: grade.toString().trim().toUpperCase(),
            gradePoints: Student.getGradePoints(
              grade.toString().trim().toUpperCase(),
            ),
            // Add marks if available
            quizMarks: this.getNumericValue(row, courseGroup.quiz, 0),
            midtermMarks: this.getNumericValue(row, courseGroup.midterm, 0),
            assignmentMarks: this.getNumericValue(
              row,
              courseGroup.assignment,
              0,
            ),
            projectMarks: this.getNumericValue(row, courseGroup.project, 0),
            finalMarks: this.getNumericValue(row, courseGroup.final, 0),
            totalMarks: this.getNumericValue(row, courseGroup.total, 0),
          };

          console.log(
            `      ✅ Multi-course created: ${course.courseCode} (${course.grade})`,
          );
          courses.push(course);
        } else {
          console.log(
            `      ⚠️ Skipping course ${courseNum} - missing code or grade`,
          );
        }
      });
    }

    console.log(`      📈 Total courses processed: ${courses.length}`);
    return courses;
  }

  async saveOrUpdateStudent(studentData) {
    const { sequelize } = require("../models");
    const transaction = await sequelize.transaction();

    try {
      console.log(
        `      💾 Starting database save for: ${studentData.studentId}`,
      );

      // Extract courses from student data
      const courses = studentData.courses || [];
      delete studentData.courses;

      console.log(
        `      🔍 Checking if student exists: ${studentData.studentId}`,
      );
      // Check if student exists
      let student = await Student.findOne({
        where: { studentId: studentData.studentId },
        transaction,
      });

      if (student) {
        console.log(
          `      🔄 Updating existing student: ${studentData.studentId}`,
        );
        await student.update(studentData, { transaction });
      } else {
        console.log(`      ➕ Creating new student: ${studentData.studentId}`);
        student = await Student.create(studentData, { transaction });
      }

      console.log(
        `      🗑️ Deleting existing courses for student: ${student.id}`,
      );
      // Delete existing courses for this student
      await Course.destroy({
        where: { studentId: student.id },
        transaction,
      });

      // Create new courses
      if (courses.length > 0) {
        console.log(`      📚 Creating ${courses.length} course(s)`);
        const coursesWithStudentId = courses.map((course) => ({
          ...course,
          studentId: student.id,
        }));

        await Course.bulkCreate(coursesWithStudentId, { transaction });
        console.log(`      ✅ Courses created successfully`);
      } else {
        console.log(`      ⚠️ No courses to create`);
      }

      console.log(`      🧮 Calculating GPA...`);
      // Recalculate GPA
      await student.calculateGPA();
      await student.save({ transaction });
      console.log(`      ✅ GPA calculated: ${student.gpa}`);

      await transaction.commit();
      console.log(
        `      ✅ Transaction committed for: ${studentData.studentId}`,
      );
      return student;
    } catch (error) {
      console.error(
        `      💥 Database save failed for ${studentData.studentId}:`,
        error.message,
      );
      console.error(`      📍 Error details:`, error);
      await transaction.rollback();
      console.log(`      🔄 Transaction rolled back`);

      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error(`Duplicate student ID: ${studentData.studentId}`);
      }
      throw error;
    }
  }

  mapColumns(headers) {
    console.log(`  🗺️ Mapping columns from headers: [${headers.join(", ")}]`);
    const mapping = {};

    headers.forEach((header, index) => {
      if (!header) {
        console.log(`    ⚠️ Empty header at index ${index}, skipping`);
        return;
      }

      const normalizedHeader = this.normalizeColumnName(
        header.toString().trim(),
      );
      if (normalizedHeader) {
        mapping[normalizedHeader] = index;
        console.log(
          `    ✅ "${header}" → "${normalizedHeader}" (index: ${index})`,
        );
      } else {
        console.log(`    ⚠️ Could not normalize header: "${header}"`);
      }
    });

    console.log(`  📊 Final column mapping:`, JSON.stringify(mapping, null, 2));
    return mapping;
  }

  normalizeColumnName(columnName) {
    if (!columnName) return "";

    // First, handle specific percentage patterns before general normalization
    let normalized = columnName.toLowerCase().trim();

    // Handle percentage patterns specifically
    if (
      /quiz\s*\(\s*5\s*%?\s*\)/i.test(normalized) ||
      /quiz\s*5\s*%?/i.test(normalized)
    ) {
      return "quiz";
    }
    if (
      /mid\s*\(\s*30\s*%?\s*\)/i.test(normalized) ||
      /midterm\s*\(\s*30\s*%?\s*\)/i.test(normalized) ||
      /mid\s*30\s*%?/i.test(normalized) ||
      /midterm\s*30\s*%?/i.test(normalized)
    ) {
      return "midterm";
    }
    if (
      /assignment\s*\(\s*15\s*%?\s*\)/i.test(normalized) ||
      /assignment\s*15\s*%?/i.test(normalized)
    ) {
      return "assignment";
    }
    if (
      /project\s*\(\s*20\s*%?\s*\)/i.test(normalized) ||
      /project\s*20\s*%?/i.test(normalized)
    ) {
      return "project";
    }
    if (
      /final\s*\(\s*50\s*%?\s*\)/i.test(normalized) ||
      /final\s*50\s*%?/i.test(normalized)
    ) {
      return "final";
    }
    if (/^quiz$/i.test(normalized)) {
      return "quiz";
    }
    if (/^mid$/i.test(normalized) || /^midterm$/i.test(normalized)) {
      return "midterm";
    }
    if (/^assignment$/i.test(normalized)) {
      return "assignment";
    }
    if (/^project$/i.test(normalized)) {
      return "project";
    }
    if (/^final$/i.test(normalized)) {
      return "final";
    }
    if (/^total$/i.test(normalized)) {
      return "total";
    }
    if (/^grade$/i.test(normalized)) {
      return "grade";
    }
    if (/student\s*name/i.test(normalized) || /full\s*name/i.test(normalized)) {
      return "fullName";
    }
    if (/^name$/i.test(normalized)) {
      return "fullName";
    }
    if (
      /student\s*id/i.test(normalized) ||
      /student\s*no/i.test(normalized) ||
      /registration\s*no/i.test(normalized) ||
      /reg\s*no/i.test(normalized)
    ) {
      return "studentId";
    }
    if (/^id$/i.test(normalized)) {
      return "studentId";
    }

    // If no percentage pattern matches, use the old normalization
    normalized = normalized
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "_")
      .trim();

    // Map common variations to standard field names
    const mappings = {
      // Student info
      name: "fullName",
      full_name: "fullName",
      student_name: "fullName",
      fullname: "fullName",

      id: "studentId",
      student_id: "studentId",
      student_no: "studentId",
      registration_no: "studentId",
      reg_no: "studentId",
      studentid: "studentId",

      dept: "department",
      department: "department",

      batch: "batch",
      year: "batch",
      admission_year: "batch",

      semester: "semester",
      sem: "semester",

      academic_year: "academicYear",
      session: "academicYear",

      email: "email",
      email_address: "email",

      phone: "phone",
      mobile: "phone",
      contact: "phone",

      status: "status",

      // Direct marks columns (for single course per row format)
      quiz: "quiz",
      quiz_5: "quiz",
      quiz5: "quiz",

      mid: "midterm",
      midterm: "midterm",
      mid_30: "midterm",
      mid30: "midterm",

      assignment: "assignment",
      assignment_15: "assignment",
      assignment15: "assignment",

      project: "project",

      final: "final",
      final_50: "final",
      final50: "final",

      total: "total",

      grade: "grade",

      // Course patterns (will be handled by regex in processCourses)
      // course1_code, course1_name, course1_credits, course1_grade, etc.
    };

    // Check for course patterns
    const coursePattern =
      /^(course|subject)(\d+)_?(code|name|title|credits?|credit_hours?|grade|quiz|midterm|mid|assignment|project|final|total)$/;
    const match = normalized.match(coursePattern);

    if (match) {
      const courseNum = match[2];
      let field = match[3];

      // Normalize field names
      if (field === "title") field = "name";
      if (field === "credits" || field === "credit_hours") field = "credits";
      if (field === "mid") field = "midterm";

      return `course${courseNum}_${field}`;
    }

    return mappings[normalized] || normalized;
  }

  // Helper method to check if a normalized column name is student-related
  isStudentRelatedColumn(normalizedColumnName) {
    const studentRelatedColumns = [
      "fullName",
      "studentId",
      "department",
      "batch",
      "semester",
      "academicYear",
      "email",
      "phone",
      "status",
      "quiz",
      "midterm",
      "assignment",
      "project",
      "final",
      "total",
      "grade",
      "name",
      "id",
    ];

    // Check direct matches
    if (studentRelatedColumns.includes(normalizedColumnName)) {
      return true;
    }

    // Check course patterns
    if (/^course\d+_/.test(normalizedColumnName)) {
      return true;
    }

    return false;
  }

  validateRequiredColumns(columnMapping, sheetName) {
    console.log(`  ✅ Validating required columns for sheet "${sheetName}"`);
    console.log(`  📋 Required columns: [${this.requiredColumns.join(", ")}]`);

    const missing = [];

    this.requiredColumns.forEach((col) => {
      const exists =
        columnMapping[col] !== undefined && columnMapping[col] !== null;
      console.log(
        `    ${exists ? "✅" : "❌"} ${col}: ${exists ? `found at index ${columnMapping[col]}` : "MISSING"}`,
      );

      if (!exists) {
        missing.push(col);
      }
    });

    if (missing.length > 0) {
      const error = `Missing required columns in sheet "${sheetName}": ${missing.join(", ")}`;
      console.error(`  💥 Validation failed: ${error}`);
      throw new Error(error);
    }

    console.log(`  ✅ All required columns found`);
  }

  getColumnValue(row, columnIndex) {
    if (
      columnIndex === undefined ||
      columnIndex === null ||
      columnIndex >= row.length
    ) {
      return "";
    }
    return row[columnIndex] ? row[columnIndex].toString().trim() : "";
  }

  getNumericValue(row, columnIndex, defaultValue = 0) {
    const value = this.getColumnValue(row, columnIndex);
    if (!value) return defaultValue;

    const numValue = parseFloat(value);
    return isNaN(numValue)
      ? defaultValue
      : Math.max(0, Math.min(100, numValue));
  }

  /**
   * Detect assessment configuration from Excel data and create/activate it
   */
  async detectAndCreateAssessmentConfig(dataRows, columnMapping, sheetName) {
    try {
      console.log(`  🔍 Detecting assessment configuration from data...`);

      // Find first row with all mark values
      let sampleMarks = null;
      for (const row of dataRows) {
        const quiz = this.getNumericValue(row, columnMapping.quiz, 0);
        const midterm = this.getNumericValue(row, columnMapping.midterm, 0);
        const assignment = this.getNumericValue(
          row,
          columnMapping.assignment,
          0,
        );
        const project = this.getNumericValue(row, columnMapping.project, 0);
        const final = this.getNumericValue(row, columnMapping.final, 0);

        // If we have at least 3 non-zero marks, use this as sample
        const nonZeroCount = [quiz, midterm, assignment, project, final].filter(
          (m) => m > 0,
        ).length;
        if (nonZeroCount >= 3) {
          sampleMarks = { quiz, midterm, assignment, project, final };
          console.log(`  📊 Sample marks found:`, sampleMarks);
          break;
        }
      }

      if (!sampleMarks) {
        console.log(`  ⚠️ No sample marks found, using default configuration`);
        return;
      }

      // Calculate total and percentages
      const total =
        sampleMarks.quiz +
        sampleMarks.midterm +
        sampleMarks.assignment +
        sampleMarks.project +
        sampleMarks.final;

      if (total === 0) {
        console.log(`  ⚠️ Total marks is 0, using default configuration`);
        return;
      }

      const detectedConfig = {
        quizWeight: parseFloat(((sampleMarks.quiz / total) * 100).toFixed(2)),
        midtermWeight: parseFloat(
          ((sampleMarks.midterm / total) * 100).toFixed(2),
        ),
        assignmentWeight: parseFloat(
          ((sampleMarks.assignment / total) * 100).toFixed(2),
        ),
        projectWeight: parseFloat(
          ((sampleMarks.project / total) * 100).toFixed(2),
        ),
        finalWeight: parseFloat(((sampleMarks.final / total) * 100).toFixed(2)),
        quizMaxMarks: sampleMarks.quiz,
        midtermMaxMarks: sampleMarks.midterm,
        assignmentMaxMarks: sampleMarks.assignment,
        projectMaxMarks: sampleMarks.project,
        finalMaxMarks: sampleMarks.final,
      };

      console.log(`  📐 Detected configuration:`, detectedConfig);

      // Check if this configuration already exists
      const { AssessmentConfig } = require("../models");

      // Create a unique config name based on the weightings
      const configName = `auto-${detectedConfig.quizWeight}-${detectedConfig.midtermWeight}-${detectedConfig.assignmentWeight}-${detectedConfig.projectWeight}-${detectedConfig.finalWeight}`;

      let existingConfig = await AssessmentConfig.findOne({
        where: { configName },
      });

      if (existingConfig) {
        console.log(`  ✅ Configuration already exists: ${configName}`);
        // Set as active
        if (!existingConfig.isActive) {
          existingConfig.isActive = true;
          await existingConfig.save();
          console.log(`  ✅ Activated existing configuration`);
        }
      } else {
        // Create new configuration
        console.log(
          `  📝 Creating new assessment configuration: ${configName}`,
        );
        const newConfig = await AssessmentConfig.create({
          configName,
          description: `Auto-detected from ${sheetName} (Quiz ${detectedConfig.quizWeight}%, Midterm ${detectedConfig.midtermWeight}%, Assignment ${detectedConfig.assignmentWeight}%, Project ${detectedConfig.projectWeight}%, Final ${detectedConfig.finalWeight}%)`,
          isActive: true,
          ...detectedConfig,
        });
        console.log(
          `  ✅ Created and activated new configuration: ${configName}`,
        );
      }
    } catch (error) {
      console.error(`  ⚠️ Failed to detect assessment config:`, error.message);
      console.log(`  ℹ️ Continuing with default configuration`);
    }
  }
}

module.exports = ExcelService;
