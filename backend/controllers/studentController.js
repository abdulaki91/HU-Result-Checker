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
        message:
          "Student not found. Please check your Student ID and try again.",
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

    const whereClause = {
      [Op.or]: [
        { fullName: { [Op.like]: `%${q.trim()}%` } },
        { studentId: { [Op.like]: `%${q.trim()}%` } },
      ],
    };

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

    // Basic format validation
    const isValid = /^[A-Z0-9-/]+$/.test(studentId.toUpperCase());

    if (!isValid) {
      return res.json({
        success: false,
        valid: false,
        message: "Invalid student ID format",
      });
    }

    // Check if student exists (without revealing full info)
    const exists = await Student.findOne({
      where: { studentId: studentId.toUpperCase() },
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
