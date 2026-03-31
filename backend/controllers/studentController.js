const { Student, Course } = require("../models/Student");
const ExcelService = require("../services/ExcelService");
const PDFService = require("../services/PDFService");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Get student by ID (public endpoint)
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    let student;
    const searchId = studentId.trim();

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

    const transcript = await student.getTranscript();

    res.json({
      success: true,
      data: transcript,
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
    let whereClause = {
      [Op.or]: [
        { fullName: { [Op.like]: `%${searchTerm}%` } },
        { studentId: { [Op.like]: `%${searchTerm}%` } },
      ],
    };

    // If search term is numeric, add additional numeric-based searches
    if (/^\d+$/.test(searchTerm)) {
      const { sequelize } = require("../models");

      // For numeric searches, we'll do a separate query and combine results
      const numericResults = await sequelize.query(
        `
        SELECT id, fullName, studentId, department, batch, gpa, status 
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
        attributes: [
          "id",
          "fullName",
          "studentId",
          "department",
          "batch",
          "gpa",
          "status",
        ],
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
      attributes: [
        "id",
        "fullName",
        "studentId",
        "department",
        "batch",
        "gpa",
        "status",
      ],
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

// Download result as PDF
const downloadResultPDF = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { studentId: studentId.toUpperCase() },
      include: [
        {
          model: Course,
          as: "courses",
          required: false,
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const pdfService = new PDFService();
    const pdfBuffer = await pdfService.generateTranscript(student);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transcript_${studentId}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
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
  downloadResultPDF,
  validateStudentId,
};
