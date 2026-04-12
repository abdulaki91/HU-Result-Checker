const { Student, Course } = require("../models/Student");
const { ColumnSetting } = require("../models");
const ExcelService = require("../services/ExcelService");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Helper function to get all column settings for student data
const getVisibleColumns = async () => {
  try {
    const allColumns = await ColumnSetting.findAll({
      order: [["displayOrder", "ASC"]],
    });

    // Get visible student columns for backend filtering
    const visibleColumns = allColumns
      .filter((col) => col.isVisible && col.columnType === "student_info")
      .map((col) => col.columnKey)
      .filter((key) =>
        [
          "id",
          "fullName",
          "studentId",
          "department",
          "batch",
          "semester",
          "academicYear",
          "email",
          "phone",
          "status",
          "gpa",
          "createdAt",
          "updatedAt",
        ].includes(key),
      );

    // Always include 'id' field as it's required for database operations
    if (!visibleColumns.includes("id")) {
      visibleColumns.unshift("id");
    }

    return {
      columns: visibleColumns,
      settings: allColumns, // Return all settings for frontend
    };
  } catch (error) {
    console.error("Error fetching visible columns:", error);
    // Fallback to default columns
    return {
      columns: [
        "id",
        "fullName",
        "studentId",
        "department",
        "batch",
        "gpa",
        "status",
      ],
      settings: [],
    };
  }
};

// Helper function to get visible course columns
const getVisibleCourseColumns = async () => {
  try {
    const visibleColumns = await ColumnSetting.findAll({
      where: {
        isVisible: true,
        columnType: ["marks", "calculated"],
      },
      order: [["displayOrder", "ASC"]],
    });

    return visibleColumns.map((col) => col.columnKey);
  } catch (error) {
    console.error("Error fetching visible course columns:", error);
    return [
      "quiz",
      "midterm",
      "assignment",
      "project",
      "final",
      "total",
      "grade",
    ];
  }
};

// Get student by ID (public endpoint)
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const deviceId = req.headers["x-device-id"]; // Device ID from frontend
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device identification required",
      });
    }

    // Check device view limit
    const { DeviceView } = require("../models");
    const device = await DeviceView.getOrCreate(deviceId, ipAddress, userAgent);

    // Check if device is locked
    if (device.isDeviceLocked()) {
      return res.status(403).json({
        success: false,
        message: "View limit exceeded for this device",
        locked: true,
        viewCount: device.viewCount,
        maxViews: device.maxViews,
        details: `This device has exceeded the maximum number of result views (${device.maxViews}). You cannot view any more student results from this device.`,
      });
    }

    let student;
    const searchId = studentId.trim();

    // Get visible course columns from settings
    const visibleCourseColumns = await getVisibleCourseColumns();
    // Get visible student info columns from settings
    const { columns: visibleStudentColumns, settings: columnSettings } =
      await getVisibleColumns();

    // First try exact match
    student = await Student.findOne({
      where: { studentId: searchId },
      include: [
        {
          model: Course,
          as: "courses",
          required: false,
        },
      ],
    });

    // If not found, try case variations
    if (!student) {
      student = await Student.findOne({
        where: { studentId: searchId.toUpperCase() },
        include: [
          {
            model: Course,
            as: "courses",
            required: false,
          },
        ],
      });
    }

    // If not found and search term is numeric, try numeric-based search
    if (!student && /^\d+$/.test(searchId)) {
      const { sequelize } = require("../models");

      // Use raw SQL to find students where the numeric part matches
      const students = await sequelize.query(
        `
        SELECT * FROM students 
        WHERE studentId LIKE '%${searchId}%'
        OR REPLACE(REPLACE(REPLACE(REPLACE(studentId, '-', ''), '/', ''), '.', ''), ' ', '') LIKE '%${searchId}%'
        LIMIT 5
      `,
        {
          type: sequelize.QueryTypes.SELECT,
        },
      );

      if (students.length === 1) {
        // Found exactly one match, get full student with courses
        student = await Student.findOne({
          where: { id: students[0].id },
          include: [
            {
              model: Course,
              as: "courses",
              required: false,
            },
          ],
        });
      } else if (students.length > 1) {
        // Multiple matches found, return list for user to choose
        return res.json({
          success: true,
          multipleMatches: true,
          message: `Found ${students.length} students with number "${searchId}". Please select one:`,
          data: students.map((s) => ({
            studentId: s.studentId,
            fullName: s.fullName,
            department: s.department,
            batch: s.batch,
          })),
        });
      }
    }

    // If still not found, try partial search
    if (!student) {
      student = await Student.findOne({
        where: {
          studentId: { [Op.like]: `%${searchId}%` },
        },
        include: [
          {
            model: Course,
            as: "courses",
            required: false,
          },
        ],
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found. Please check your Student ID and try again.",
        suggestions: /^\d+$/.test(searchId)
          ? "Tip: You can search using just the numeric part of your ID (e.g., '001' for 'CS-2023-001')"
          : "Make sure you entered the correct student ID format",
      });
    }

    // Increment device view count (not per-student)
    const newViewCount = await device.incrementView();

    const transcript = await student.getTranscript();

    // Filter course data based on visible columns
    if (transcript.courses && transcript.courses.length > 0) {
      transcript.courses = transcript.courses.map((course) => {
        const filteredCourse = { ...course };

        // Keep essential course columns and visible mark columns
        Object.keys(filteredCourse).forEach((key) => {
          if (
            ![
              "courseCode",
              "courseName",
              "creditHours",
              "grade",
              "gradePoints",
              "marks",
            ].includes(key) &&
            !visibleCourseColumns.includes(key)
          ) {
            delete filteredCourse[key];
          }
        });

        return filteredCourse;
      });
    }

    res.json({
      success: true,
      data: transcript,
      visibleColumns: visibleCourseColumns,
      columnSettings: columnSettings.filter(
        (col) =>
          ["marks", "calculated"].includes(col.columnType) ||
          ["student_info"].includes(col.columnType),
      ),
      viewInfo: {
        viewCount: newViewCount,
        maxViews: device.maxViews,
        remainingViews: Math.max(0, device.maxViews - newViewCount),
        isLocked: device.isDeviceLocked(),
        message: `You have ${Math.max(0, device.maxViews - newViewCount)} view(s) remaining on this device`,
      },
    });
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Search students (public endpoint with limited info)
const searchStudents = async (req, res) => {
  try {
    const { q, department, batch } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const searchTerm = q.trim();

    // Get visible columns from settings
    const { columns: visibleColumns } = await getVisibleColumns();

    let whereClause = {
      [Op.or]: [
        { fullName: { [Op.like]: `%${searchTerm}%` } },
        { studentId: { [Op.like]: `%${searchTerm}%` } },
      ],
    };

    // If search term is numeric, add additional numeric-based searches
    if (/^\d+$/.test(searchTerm)) {
      const { sequelize } = require("../models");

      // Build dynamic SELECT clause based on visible columns
      const selectColumns = visibleColumns.join(", ");

      // For numeric searches, we'll do a separate query and combine results
      const numericResults = await sequelize.query(
        `
        SELECT ${selectColumns}
        FROM students 
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(studentId, '-', ''), '/', ''), '.', ''), ' ', '') LIKE '%${searchTerm}%'
        ${department ? `AND department = '${department}'` : ""}
        ${batch ? `AND batch = '${batch}'` : ""}
        LIMIT 10
      `,
        {
          type: sequelize.QueryTypes.SELECT,
        },
      );

      // Also do the regular search
      if (department) {
        whereClause.department = department;
      }
      if (batch) {
        whereClause.batch = batch;
      }

      const regularResults = await Student.findAll({
        where: whereClause,
        attributes: visibleColumns,
        limit: 10,
        order: [["fullName", "ASC"]],
      });

      // Combine and deduplicate results
      const allResults = [...regularResults];
      numericResults.forEach((numResult) => {
        if (!allResults.find((reg) => reg.id === numResult.id)) {
          allResults.push(numResult);
        }
      });

      return res.json({
        success: true,
        data: allResults.slice(0, 20), // Limit to 20 total results
        count: allResults.length,
        searchTerm: searchTerm,
        isNumericSearch: true,
        message:
          allResults.length > 0
            ? `Found ${allResults.length} student(s) matching "${searchTerm}"`
            : `No students found with number "${searchTerm}"`,
      });
    }

    // Regular non-numeric search
    // Add filters if provided
    if (department) {
      whereClause.department = department;
    }
    if (batch) {
      whereClause.batch = batch;
    }

    const students = await Student.findAll({
      where: whereClause,
      attributes: visibleColumns,
      limit: 20,
      order: [["fullName", "ASC"]],
    });

    res.json({
      success: true,
      data: students,
      count: students.length,
      searchTerm: searchTerm,
      isNumericSearch: false,
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get departments and batches (public endpoint)
const getFilters = async (req, res) => {
  try {
    const { sequelize } = require("../models");

    const [departmentResults, batchResults] = await Promise.all([
      sequelize.query(
        "SELECT DISTINCT department FROM students ORDER BY department",
        { type: sequelize.QueryTypes.SELECT },
      ),
      sequelize.query(
        "SELECT DISTINCT batch FROM students ORDER BY batch DESC",
        { type: sequelize.QueryTypes.SELECT },
      ),
    ]);

    const departments = departmentResults.map((row) => row.department);
    const batches = batchResults.map((row) => row.batch);

    res.json({
      success: true,
      data: {
        departments,
        batches,
      },
    });
  } catch (error) {
    console.error("Get filters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Validate student ID format
const validateStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Updated validation pattern to be more flexible
    const isValid = /^[A-Za-z0-9\-\/\.\s]+$/.test(studentId);

    if (!isValid) {
      return res.json({
        success: false,
        valid: false,
        message: "Invalid student ID format",
      });
    }

    // Check if student exists (without revealing full info)
    const exists = await Student.findOne({
      where: {
        [Op.or]: [
          { studentId: studentId },
          { studentId: studentId.toUpperCase() },
        ],
      },
      attributes: ["id"],
    });

    res.json({
      success: true,
      valid: isValid,
      exists: !!exists,
      message: exists ? "Student ID found" : "Student ID not found in records",
    });
  } catch (error) {
    console.error("Validate student ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate student ID",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getStudentById,
  searchStudents,
  getFilters,
  validateStudentId,
};
