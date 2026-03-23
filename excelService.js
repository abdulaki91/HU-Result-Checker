const XLSX = require("xlsx");
const axios = require("axios");
const fs = require("fs").promises;

class ExcelService {
  constructor() {
    // Flexible column mapping - supports various column name formats
    this.columnMappings = {
      studentName: [
        "STUDENT NAME",
        "STUDENT_NAME",
        "NAME",
        "FULL NAME",
        "FULLNAME",
        "STUDENT",
        "PUPIL NAME",
        "PUPIL_NAME",
      ],
      studentId: [
        "STUDENT ID",
        "STUDENT_ID",
        "ID",
        "STUDENT NO",
        "STUDENT_NO",
        "REGISTRATION NO",
        "REG NO",
        "ROLL NO",
        "ROLL_NO",
        "NUMBER",
      ],
      // Optional columns - will use default values if not found
      quiz: [
        "QUIZ",
        "QUIZ(5%)",
        "QUIZ (5%)",
        "QUIZ_5",
        "QUIZ MARKS",
        "QUIZ_MARKS",
        "Q",
        "QUIZ SCORE",
        "QUIZ_SCORE",
      ],
      mid: [
        "MID",
        "MID(30%)",
        "MID (30%)",
        "MID_30",
        "MIDTERM",
        "MID TERM",
        "MID_TERM",
        "MID EXAM",
        "MID_EXAM",
        "MIDTERM EXAM",
        "MIDTERM_EXAM",
      ],
      assignment: [
        "ASSIGNMENT",
        "ASSIGNMENT(15%)",
        "ASSIGNMENT (15%)",
        "ASSIGNMENT_15",
        "ASSIGN",
        "ASSIGNMENTS",
        "HOMEWORK",
        "HW",
        "COURSEWORK",
      ],
      groupAssignment: [
        "GROUP ASSIGNMENT",
        "GROUP_ASSIGNMENT",
        "GROUP ASSIGN",
        "GROUP_ASSIGN",
        "GROUP PROJECT",
        "GROUP_PROJECT",
        "TEAM ASSIGNMENT",
        "TEAM_ASSIGNMENT",
        "COLLABORATIVE WORK",
        "COLLABORATIVE_WORK",
      ],
      project: [
        "PROJECT",
        "FINAL PROJECT",
        "FINAL_PROJECT",
        "TERM PROJECT",
        "TERM_PROJECT",
        "CAPSTONE",
        "THESIS",
        "RESEARCH PROJECT",
        "RESEARCH_PROJECT",
      ],
      final: [
        "FINAL",
        "FINAL(50%)",
        "FINAL (50%)",
        "FINAL_50",
        "FINAL EXAM",
        "FINAL_EXAM",
        "FINALS",
        "FINAL TEST",
        "FINAL_TEST",
      ],
      total: [
        "TOTAL",
        "TOTAL MARKS",
        "TOTAL_MARKS",
        "TOTAL SCORE",
        "TOTAL_SCORE",
        "SUM",
        "OVERALL",
        "AGGREGATE",
      ],
      grade: [
        "GRADE",
        "LETTER GRADE",
        "LETTER_GRADE",
        "FINAL GRADE",
        "FINAL_GRADE",
        "RESULT",
        "CLASS",
        "RATING",
      ],
    };

    // Required columns - only these are mandatory
    this.requiredFields = ["studentName", "studentId"];
  }

  async downloadFile(fileUrl, filePath) {
    try {
      const response = await axios({
        method: "GET",
        url: fileUrl,
        responseType: "stream",
      });

      const writer = require("fs").createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("❌ Failed to download file:", error.message);
      throw new Error("Failed to download Excel file");
    }
  }

  parseExcelFile(filePath) {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);

      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      console.log("📊 Parsing Excel file:", filePath);

      // Try multiple parsing approaches
      let cleanedData = [];

      // Approach 1: Try to find actual data by scanning multiple rows
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      console.log("📋 Excel range:", range);

      for (let startRow = 0; startRow <= Math.min(5, range.e.r); startRow++) {
        try {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            range: startRow,
            defval: "",
            blankrows: false,
            raw: false,
          });

          if (jsonData.length === 0) continue;

          console.log(
            `📊 Trying from row ${startRow}, found ${jsonData.length} rows`,
          );
          console.log("📋 First row keys:", Object.keys(jsonData[0]));

          // Clean the data
          const testCleanedData = [];
          for (const row of jsonData) {
            const cleanedRow = this.cleanRowData(row);
            if (Object.keys(cleanedRow).length >= 2) {
              testCleanedData.push(cleanedRow);
            }
          }

          console.log(`📊 After cleaning: ${testCleanedData.length} rows`);

          if (testCleanedData.length > 0) {
            console.log("📋 Sample cleaned row:", testCleanedData[0]);

            // Check if this looks like valid data
            const firstRow = testCleanedData[0];
            const keys = Object.keys(firstRow);

            // Look for name-like and id-like columns
            const hasNameColumn = keys.some(
              (key) =>
                key.toUpperCase().includes("NAME") ||
                key.toUpperCase().includes("STUDENT") ||
                key.toUpperCase() === "NAME",
            );

            const hasIdColumn = keys.some(
              (key) =>
                key.toUpperCase().includes("ID") ||
                key.toUpperCase().includes("NO") ||
                key.toUpperCase() === "ID",
            );

            if (hasNameColumn || hasIdColumn || keys.length >= 2) {
              cleanedData = testCleanedData;
              console.log("✅ Found valid data structure");
              break;
            }
          }
        } catch (error) {
          console.log(`❌ Failed parsing from row ${startRow}:`, error.message);
          continue;
        }
      }

      // Approach 2: If still no data, try raw parsing and manual cleaning
      if (cleanedData.length === 0) {
        console.log("📊 Trying raw parsing approach...");

        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Use array format
          defval: "",
          blankrows: false,
          raw: false,
        });

        console.log("📊 Raw data rows:", rawData.length);

        // Find the first row that looks like headers
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (row && row.length >= 2) {
            const nonEmptyValues = row.filter(
              (val) => val && val.toString().trim(),
            );
            if (nonEmptyValues.length >= 2) {
              console.log(`📋 Potential header row ${i}:`, row);
              headerRowIndex = i;
              break;
            }
          }
        }

        if (headerRowIndex >= 0 && headerRowIndex < rawData.length - 1) {
          const headers = rawData[headerRowIndex];
          const dataRows = rawData.slice(headerRowIndex + 1);

          console.log("📋 Using headers:", headers);
          console.log("📊 Data rows:", dataRows.length);

          // Convert to object format
          for (const dataRow of dataRows) {
            if (!dataRow || dataRow.length === 0) continue;

            const rowObj = {};
            let hasData = false;

            for (let i = 0; i < Math.min(headers.length, dataRow.length); i++) {
              const header = headers[i];
              const value = dataRow[i];

              if (
                header &&
                value &&
                header.toString().trim() &&
                value.toString().trim()
              ) {
                rowObj[header.toString().trim()] = value.toString().trim();
                hasData = true;
              }
            }

            if (hasData && Object.keys(rowObj).length >= 2) {
              cleanedData.push(rowObj);
            }
          }
        }
      }

      if (cleanedData.length === 0) {
        throw new Error(
          `Could not find valid student data in Excel file.\n\n` +
            `Please ensure your Excel file has:\n` +
            `• Clear column headers (like NAME, ID, etc.)\n` +
            `• Student data in rows below the headers\n` +
            `• No merged cells or complex formatting\n\n` +
            `Try creating a simple Excel file with just:\n` +
            `• Column 1: NAME or STUDENT NAME\n` +
            `• Column 2: ID or STUDENT ID\n` +
            `• Additional columns for scores (optional)`,
        );
      }

      console.log(`✅ Final cleaned data: ${cleanedData.length} rows`);

      // Validate columns using the first data row
      this.validateColumns(cleanedData[0]);

      // Process and validate data
      const processedData = this.processStudentData(cleanedData);

      return processedData;
    } catch (error) {
      console.error("❌ Failed to parse Excel file:", error.message);
      throw error;
    }
  }

  cleanRowData(row) {
    const cleaned = {};
    for (const [key, value] of Object.entries(row)) {
      // Skip empty columns, undefined keys, and title-like content
      if (
        key.startsWith("__EMPTY") ||
        key === "undefined" ||
        !key ||
        key.includes("INDEX") ||
        key.includes("REPORT") ||
        key.includes("HU-ISIMS") ||
        key.includes("RIS") ||
        key.includes("-")
      ) {
        continue;
      }

      const cleanKey = key.toString().trim();
      const cleanValue = value ? value.toString().trim() : "";

      // Only include if both key and value are meaningful
      if (cleanKey && cleanValue && cleanKey.length > 1) {
        cleaned[cleanKey] = cleanValue;
      }
    }
    return cleaned;
  }

  looksLikeHeaderRow(row) {
    const values = Object.values(row);
    const textValues = values.filter(
      (v) => typeof v === "string" && v.length > 2 && isNaN(parseFloat(v)),
    );

    // If most values are text and not numbers, it's likely a header
    return textValues.length >= values.length * 0.6;
  }

  extractColumnNames(headerRow) {
    const columnNames = {};
    let index = 0;

    for (const [key, value] of Object.entries(headerRow)) {
      if (!key.startsWith("__EMPTY") && value && value.toString().trim()) {
        columnNames[index] = value.toString().trim().toUpperCase();
        index++;
      }
    }

    return columnNames;
  }

  remapRowWithNewHeaders(row, newColumnNames) {
    const remapped = {};
    let index = 0;

    for (const [key, value] of Object.entries(row)) {
      if (!key.startsWith("__EMPTY") && newColumnNames[index]) {
        remapped[newColumnNames[index]] = value;
        index++;
      }
    }

    return remapped;
  }

  hasValidStudentData(row) {
    const values = Object.values(row);
    const nonEmptyValues = values.filter(
      (v) => v !== null && v !== undefined && v.toString().trim() !== "",
    );

    // Should have at least 4 non-empty values for a valid student record
    return nonEmptyValues.length >= 4;
  }

  validateColumns(firstRow) {
    const availableColumns = Object.keys(firstRow).map((col) =>
      col.toUpperCase().trim(),
    );

    // If we have very few columns or they look like Excel artifacts, provide better guidance
    if (
      availableColumns.length < 2 ||
      availableColumns.some((col) => col.startsWith("__EMPTY"))
    ) {
      throw new Error(
        `Excel file format issue detected.\n\n` +
          `Available columns: ${availableColumns.join(", ")}\n\n` +
          `💡 *Common fixes:*\n` +
          `• Remove merged cells in your Excel file\n` +
          `• Ensure the first row contains clear column headers\n` +
          `• Remove any empty rows above your data\n` +
          `• Save as a clean .xlsx file\n\n` +
          `*Required columns (any variation):*\n` +
          `• Student Name (NAME, STUDENT NAME, FULL NAME, etc.)\n` +
          `• Student ID (ID, STUDENT ID, REG NO, etc.)\n\n` +
          `*Optional columns:*\n` +
          `• Quiz, Mid, Assignment, Final, Total, Grade (will use defaults if missing)`,
      );
    }

    const columnMapping = this.mapColumns(availableColumns);
    const missingFields = [];

    // Check if we found a mapping for each REQUIRED field only
    for (const fieldName of this.requiredFields) {
      if (!columnMapping[fieldName] || !columnMapping[fieldName].found) {
        missingFields.push(fieldName);
      }
    }

    if (missingFields.length > 0) {
      const availableColumnsStr = availableColumns.join(", ");
      const missingFieldsReadable = missingFields.map((field) => {
        if (field === "studentName") return "Student Name";
        if (field === "studentId") return "Student ID";
        return field;
      });

      throw new Error(
        `Missing required columns: ${missingFieldsReadable.join(", ")}\n\n` +
          `Available columns in your file: ${availableColumnsStr}\n\n` +
          `💡 *Required columns (any variation):*\n` +
          `• Student Name: ${this.columnMappings.studentName.slice(0, 5).join(", ")}, etc.\n` +
          `• Student ID: ${this.columnMappings.studentId.slice(0, 5).join(", ")}, etc.\n\n` +
          `*Optional columns (will use defaults if missing):*\n` +
          `• Quiz, Mid, Assignment, Final, Total, Grade`,
      );
    }

    // Store the mapping for use in data processing
    this.detectedColumnMapping = columnMapping;
  }

  mapColumns(availableColumns) {
    const mapping = {};

    for (const [fieldName, possibleNames] of Object.entries(
      this.columnMappings,
    )) {
      mapping[fieldName] = { found: false, columnName: null };

      for (const possibleName of possibleNames) {
        if (availableColumns.includes(possibleName.toUpperCase())) {
          mapping[fieldName] = {
            found: true,
            columnName: possibleName.toUpperCase(),
          };
          break;
        }
      }
    }

    return mapping;
  }

  processStudentData(jsonData) {
    const processedData = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i];
        const rowNumber = i + 2; // Excel row number (accounting for header)

        // Normalize column names and extract data using flexible mapping
        const normalizedRow = this.normalizeColumnNames(row);

        const studentData = {
          studentName: this.validateAndClean(
            normalizedRow[this.detectedColumnMapping.studentName.columnName],
            "string",
            `Row ${rowNumber}: Student Name`,
          ),
          studentId: this.validateAndClean(
            normalizedRow[this.detectedColumnMapping.studentId.columnName],
            "string",
            `Row ${rowNumber}: Student ID`,
          ),
          // Optional fields with defaults
          quiz: this.getOptionalValue(normalizedRow, "quiz", 0),
          mid: this.getOptionalValue(normalizedRow, "mid", 0),
          assignment: this.getOptionalValue(normalizedRow, "assignment", 0),
          groupAssignment: this.getOptionalValue(
            normalizedRow,
            "groupAssignment",
            0,
          ),
          project: this.getOptionalValue(normalizedRow, "project", 0),
          final: this.getOptionalValue(normalizedRow, "final", 0),
          total: this.getOptionalValue(normalizedRow, "total", 0),
          grade: this.getOptionalGradeValue(normalizedRow, "grade", "--"),
        };

        // Additional validation
        if (
          !studentData.studentId ||
          studentData.studentId.toString().trim() === ""
        ) {
          throw new Error(`Row ${rowNumber}: Student ID cannot be empty`);
        }

        processedData.push(studentData);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Data validation errors:\n${errors.join("\n")}`);
    }

    if (processedData.length === 0) {
      throw new Error("No valid student data found in Excel file");
    }

    // Check for duplicate student IDs
    this.checkForDuplicates(processedData);

    return processedData;
  }

  getOptionalValue(normalizedRow, fieldName, defaultValue) {
    try {
      if (
        !this.detectedColumnMapping[fieldName] ||
        !this.detectedColumnMapping[fieldName].found
      ) {
        return defaultValue;
      }

      const columnName = this.detectedColumnMapping[fieldName].columnName;
      const value = normalizedRow[columnName];

      if (value === null || value === undefined || value === "") {
        return defaultValue;
      }

      // For nullable columns (groupAssignment, project), allow null as default
      if (defaultValue === null) {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      }

      const num = parseFloat(value);
      return isNaN(num) ? defaultValue : num;
    } catch (error) {
      return defaultValue;
    }
  }

  getOptionalGradeValue(normalizedRow, fieldName, defaultValue) {
    try {
      if (
        !this.detectedColumnMapping[fieldName] ||
        !this.detectedColumnMapping[fieldName].found
      ) {
        return defaultValue;
      }

      const columnName = this.detectedColumnMapping[fieldName].columnName;
      const value = normalizedRow[columnName];

      if (value === null || value === undefined || value === "") {
        return defaultValue;
      }

      // Allow any string value for grade, including "--", "N/A", etc.
      return value.toString().trim();
    } catch (error) {
      return defaultValue;
    }
  }

  normalizeColumnNames(row) {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.toUpperCase().trim();
      normalized[normalizedKey] = value;
    }
    return normalized;
  }

  validateAndClean(value, type, fieldName) {
    if (value === null || value === undefined || value === "") {
      throw new Error(`${fieldName} is required`);
    }

    if (type === "string") {
      return value.toString().trim();
    }

    if (type === "number") {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
      }
      return num;
    }

    return value;
  }

  checkForDuplicates(data) {
    const studentIds = data.map((student) =>
      student.studentId.toString().toLowerCase(),
    );
    const duplicates = studentIds.filter(
      (id, index) => studentIds.indexOf(id) !== index,
    );

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate Student IDs found: ${[...new Set(duplicates)].join(", ")}`,
      );
    }
  }

  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error("⚠️ Failed to cleanup file:", error.message);
    }
  }

  async formatStudentResult(student, database = null) {
    let columnSettings = {};
    let courseSettings = {};

    // Get column settings and course settings if database is provided
    if (database) {
      try {
        columnSettings = await database.getColumnSettings();
        courseSettings = await database.getCourseSettings();
      } catch (error) {
        console.error("❌ Failed to get settings:", error.message);
        // Use default settings (show all columns)
        columnSettings = {
          quiz: true,
          mid: true,
          assignment: true,
          groupAssignment: true,
          project: true,
          final: true,
          total: true,
          grade: true,
        };
        courseSettings = {
          courseName: "Course Name",
          instructorName: "Instructor Name",
        };
      }
    } else {
      // Default to showing all columns if no database provided
      columnSettings = {
        quiz: true,
        mid: true,
        assignment: true,
        groupAssignment: true,
        project: true,
        final: true,
        total: true,
        grade: true,
      };
      courseSettings = {
        courseName: "Course Name",
        instructorName: "Instructor Name",
      };
    }

    let result = `🎓 *Student Result*

📚 *Course:* ${courseSettings.courseName}
👨‍🏫 *Instructor:* ${courseSettings.instructorName}

👤 *Name:* ${student.studentName}
🆔 *ID:* ${student.studentId}`;

    // Add optional columns based on settings
    if (columnSettings.quiz !== false) {
      result += `\n📝 *Quiz:* ${student.quiz}`;
    }

    if (columnSettings.mid !== false) {
      result += `\n📚 *Mid:* ${student.mid}`;
    }

    if (columnSettings.assignment !== false) {
      result += `\n📋 *Assignment:* ${student.assignment}`;
    }

    if (columnSettings.groupAssignment !== false) {
      result += `\n👥 *Group Assignment:* ${student.groupAssignment || 0}`;
    }

    if (columnSettings.project !== false) {
      result += `\n🚀 *Project:* ${student.project || 0}`;
    }

    if (columnSettings.final !== false) {
      result += `\n📖 *Final:* ${student.final}`;
    }

    if (columnSettings.total !== false) {
      result += `\n📊 *Total:* ${student.total}`;
    }

    if (columnSettings.grade !== false) {
      result += `\n🏆 *Grade:* ${student.grade}`;
    }

    return result;
  }
}

module.exports = ExcelService;
