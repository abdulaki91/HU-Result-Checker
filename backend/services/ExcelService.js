const XLSX = require("xlsx");
const { Student, Course } = require("../models/Student");
const fs = require("fs");

class ExcelService {
  constructor() {
    this.requiredColumns = ["fullName", "studentId", "department", "batch"];
    this.optionalColumns = [
      "semester",
      "academicYear",
      "email",
      "phone",
      "status",
    ];
    this.courseColumns = ["courseCode", "courseName", "creditHours", "grade"];
  }

  async parseAndImportStudents(filePath, uploadedBy) {
    try {
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;

      if (sheetNames.length === 0) {
        throw new Error("Excel file contains no sheets");
      }

      let totalProcessed = 0;
      let totalErrors = 0;
      const results = [];
      const errors = [];

      // Process each sheet (assuming each sheet is a different department/batch)
      for (const sheetName of sheetNames) {
        try {
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
        } catch (error) {
          errors.push({
            sheet: sheetName,
            error: error.message,
          });
          totalErrors++;
        }
      }

      return {
        success: true,
        totalProcessed,
        totalErrors,
        sheets: results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  async processSheet(workbook, sheetName, uploadedBy) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (jsonData.length < 2) {
      throw new Error(
        `Sheet "${sheetName}" must contain at least a header row and one data row`,
      );
    }

    const [headerRow, ...dataRows] = jsonData;
    const columnMapping = this.mapColumns(headerRow);

    // Validate required columns
    this.validateRequiredColumns(columnMapping, sheetName);

    const students = [];
    const errors = [];

    for (let i = 0; i < dataRows.length; i++) {
      const rowIndex = i + 2; // Excel row number (1-indexed + header)

      try {
        const studentData = this.processStudentRow(
          dataRows[i],
          columnMapping,
          sheetName,
        );
        if (studentData) {
          studentData.uploadedBy = uploadedBy;
          students.push(studentData);
        }
      } catch (error) {
        errors.push({
          row: rowIndex,
          error: error.message,
        });
      }
    }

    // Save students to database
    let processed = 0;
    const saveErrors = [];

    for (const studentData of students) {
      try {
        await this.saveOrUpdateStudent(studentData);
        processed++;
      } catch (error) {
        saveErrors.push({
          studentId: studentData.studentId,
          error: error.message,
        });
      }
    }

    return {
      processed,
      total: students.length,
      errors: [...errors, ...saveErrors],
    };
  }

  processStudentRow(row, columnMapping, sheetName) {
    // Skip empty rows
    if (!row || row.every((cell) => !cell || cell.toString().trim() === "")) {
      return null;
    }

    const student = {};

    // Required fields
    student.fullName = this.getColumnValue(row, columnMapping.fullName);
    student.studentId = this.getColumnValue(row, columnMapping.studentId);
    student.department = this.getColumnValue(row, columnMapping.department);
    student.batch = this.getColumnValue(row, columnMapping.batch);

    // Validate required fields
    if (
      !student.fullName ||
      !student.studentId ||
      !student.department ||
      !student.batch
    ) {
      throw new Error(
        "Missing required fields: Full Name, Student ID, Department, and Batch are mandatory",
      );
    }

    // Clean and validate student ID
    student.studentId = student.studentId.toString().trim().toUpperCase();
    if (!/^[A-Z0-9-/]+$/.test(student.studentId)) {
      throw new Error(`Invalid student ID format: ${student.studentId}`);
    }

    // Validate batch format (should be 4-digit year)
    student.batch = student.batch.toString().trim();
    if (!/^\d{4}$/.test(student.batch)) {
      throw new Error(
        `Invalid batch format: ${student.batch}. Expected 4-digit year (e.g., 2023)`,
      );
    }

    // Optional fields with defaults
    student.semester =
      this.getColumnValue(row, columnMapping.semester) || "Fall";
    student.academicYear =
      this.getColumnValue(row, columnMapping.academicYear) ||
      `${student.batch}-${parseInt(student.batch) + 1}`;
    student.email = this.getColumnValue(row, columnMapping.email) || null;
    student.phone = this.getColumnValue(row, columnMapping.phone) || null;
    student.status = this.getColumnValue(row, columnMapping.status) || "Active";

    // Validate email format if provided
    if (
      student.email &&
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(student.email)
    ) {
      throw new Error(`Invalid email format: ${student.email}`);
    }

    // Process courses
    student.courses = this.processCourses(row, columnMapping);

    return student;
  }

  processCourses(row, columnMapping) {
    const courses = [];

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

    // Process each course group
    Object.keys(courseGroups).forEach((courseNum) => {
      const courseGroup = courseGroups[courseNum];

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
          assignmentMarks: this.getNumericValue(row, courseGroup.assignment, 0),
          projectMarks: this.getNumericValue(row, courseGroup.project, 0),
          finalMarks: this.getNumericValue(row, courseGroup.final, 0),
          totalMarks: this.getNumericValue(row, courseGroup.total, 0),
        };

        courses.push(course);
      }
    });

    return courses;
  }

  async saveOrUpdateStudent(studentData) {
    const { sequelize } = require("../models");
    const transaction = await sequelize.transaction();

    try {
      // Extract courses from student data
      const courses = studentData.courses || [];
      delete studentData.courses;

      // Check if student exists
      let student = await Student.findOne({
        where: { studentId: studentData.studentId },
        transaction,
      });

      if (student) {
        // Update existing student
        await student.update(studentData, { transaction });
      } else {
        // Create new student
        student = await Student.create(studentData, { transaction });
      }

      // Delete existing courses for this student
      await Course.destroy({
        where: { studentId: student.id },
        transaction,
      });

      // Create new courses
      if (courses.length > 0) {
        const coursesWithStudentId = courses.map((course) => ({
          ...course,
          studentId: student.id,
        }));

        await Course.bulkCreate(coursesWithStudentId, { transaction });
      }

      // Recalculate GPA
      await student.calculateGPA();
      await student.save({ transaction });

      await transaction.commit();
      return student;
    } catch (error) {
      await transaction.rollback();

      if (error.name === "SequelizeUniqueConstraintError") {
        throw new Error(`Duplicate student ID: ${studentData.studentId}`);
      }
      throw error;
    }
  }

  mapColumns(headers) {
    const mapping = {};

    headers.forEach((header, index) => {
      if (!header) return;

      const normalizedHeader = this.normalizeColumnName(
        header.toString().trim(),
      );
      if (normalizedHeader) {
        mapping[normalizedHeader] = index;
      }
    });

    return mapping;
  }

  normalizeColumnName(columnName) {
    if (!columnName) return "";

    const normalized = columnName
      .toLowerCase()
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

  validateRequiredColumns(columnMapping, sheetName) {
    const missing = [];

    this.requiredColumns.forEach((col) => {
      if (!columnMapping[col]) {
        missing.push(col);
      }
    });

    if (missing.length > 0) {
      throw new Error(
        `Missing required columns in sheet "${sheetName}": ${missing.join(", ")}`,
      );
    }
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
}

module.exports = ExcelService;
