const { Student, Course, User, sequelize } = require("../models");
const ExcelService = require("../services/ExcelService");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

// Get all students with pagination and filters
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { department, batch, semester, status, search } = req.query;

    // Build filter query
    const whereClause = {};
    if (department) whereClause.department = department;
    if (batch) whereClause.batch = batch;
    if (semester) whereClause.semester = semester;
    if (status) whereClause.status = status;

    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { studentId: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["fullName", "username"],
          required: false,
        },
      ],
      order: [["fullName", "ASC"]],
      offset,
      limit,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get student details (admin view with full info)
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: "uploader",
          attributes: ["fullName", "username", "email"],
          required: false,
        },
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

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Upload Excel file and import students
const uploadExcel = async (req, res) => {
  try {
    console.log(`\n🚀 Excel upload started`);
    console.log(`👤 User: ${req.user.id} (${req.user.username})`);
    console.log(`📅 Time: ${new Date().toISOString()}`);

    if (!req.file) {
      console.error(`❌ No file uploaded`);
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log(`📁 File details:`);
    console.log(`   - Original name: ${req.file.originalname}`);
    console.log(`   - Size: ${req.file.size} bytes`);
    console.log(`   - Path: ${req.file.path}`);
    console.log(`   - Mimetype: ${req.file.mimetype}`);

    const excelService = new ExcelService();

    // Parse Excel file
    console.log(`🔄 Starting Excel parsing...`);
    const result = await excelService.parseAndImportStudents(
      req.file.path,
      req.user.id,
    );

    console.log(`✅ Excel processing completed successfully`);
    console.log(`📊 Final results:`);
    console.log(`   - Total processed: ${result.totalProcessed}`);
    console.log(`   - Total errors: ${result.totalErrors}`);
    console.log(
      `   - Success rate: ${result.totalProcessed > 0 ? ((result.totalProcessed / (result.totalProcessed + result.totalErrors)) * 100).toFixed(1) : 0}%`,
    );

    // Clean up uploaded file
    const fs = require("fs").promises;
    try {
      await fs.unlink(req.file.path);
      console.log(`🗑️ Temporary file cleaned up: ${req.file.path}`);
    } catch (cleanupError) {
      console.warn(
        `⚠️ Failed to cleanup uploaded file: ${cleanupError.message}`,
      );
    }

    res.json({
      success: true,
      message: "Excel file processed successfully",
      data: result,
    });
  } catch (error) {
    console.error(`💥 Excel upload failed:`, error.message);
    console.error(`📍 Stack trace:`, error.stack);
    console.error(`🕐 Time: ${new Date().toISOString()}`);

    // Clean up file on error
    if (req.file) {
      const fs = require("fs").promises;
      try {
        await fs.unlink(req.file.path);
        console.log(`🗑️ Cleaned up file after error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn(
          `⚠️ Failed to cleanup uploaded file after error: ${cleanupError.message}`,
        );
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to process Excel file",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update student information
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Add metadata
    updateData.lastUpdated = new Date();

    const [updatedRowsCount] = await Student.update(updateData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Course,
          as: "courses",
          required: false,
        },
      ],
    });

    // Recalculate GPA if courses were updated
    if (student) {
      await student.calculateGPA();
      await student.save();
    }

    res.json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Update student error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRowsCount = await Student.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully",
      data: { deletedId: id },
    });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get statistics
const getStatistics = async (req, res) => {
  try {
    const totalStudents = await Student.count();

    // Department stats
    const departmentStats = await Student.findAll({
      attributes: [
        "department",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("gpa")), "avgGPA"],
      ],
      group: ["department"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    });

    // Batch stats
    const batchStats = await Student.findAll({
      attributes: [
        "batch",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("AVG", sequelize.col("gpa")), "avgGPA"],
      ],
      group: ["batch"],
      order: [["batch", "DESC"]],
      raw: true,
    });

    // Grade stats from courses
    const gradeStats = await Course.findAll({
      attributes: [
        "grade",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["grade"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    });

    // Status stats
    const statusStats = await Student.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // GPA distribution
    const gpaRanges = await sequelize.query(
      `
      SELECT 
        CASE 
          WHEN gpa >= 3.5 THEN '3.5-4.0'
          WHEN gpa >= 3.0 THEN '3.0-3.5'
          WHEN gpa >= 2.5 THEN '2.5-3.0'
          WHEN gpa >= 2.0 THEN '2.0-2.5'
          ELSE 'Below 2.0'
        END as gpa_range,
        COUNT(*) as count
      FROM students 
      GROUP BY 
        CASE 
          WHEN gpa >= 3.5 THEN '3.5-4.0'
          WHEN gpa >= 3.0 THEN '3.0-3.5'
          WHEN gpa >= 2.5 THEN '2.5-3.0'
          WHEN gpa >= 2.0 THEN '2.0-2.5'
          ELSE 'Below 2.0'
        END
    `,
      { type: sequelize.QueryTypes.SELECT },
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          lastUpdated: new Date().toISOString(),
        },
        departments: departmentStats.map((dept) => ({
          _id: dept.department,
          count: parseInt(dept.count),
          avgGPA: parseFloat(dept.avgGPA) || 0,
        })),
        batches: batchStats.map((batch) => ({
          _id: batch.batch,
          count: parseInt(batch.count),
          avgGPA: parseFloat(batch.avgGPA) || 0,
        })),
        grades: gradeStats.map((grade) => ({
          _id: grade.grade,
          count: parseInt(grade.count),
        })),
        status: statusStats.map((status) => ({
          _id: status.status,
          count: parseInt(status.count),
        })),
        gpaDistribution: gpaRanges,
      },
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Bulk operations
const bulkDelete = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student IDs array is required",
      });
    }

    const deletedCount = await Student.destroy({
      where: {
        id: {
          [Op.in]: studentIds,
        },
      },
    });

    res.json({
      success: true,
      message: `${deletedCount} students deleted successfully`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Clear all students (with confirmation)
const clearAllStudents = async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== "DELETE_ALL_STUDENTS") {
      return res.status(400).json({
        success: false,
        message:
          'Invalid confirmation. Please type "DELETE_ALL_STUDENTS" to confirm.',
      });
    }

    const deletedCount = await Student.destroy({
      where: {},
      truncate: true,
    });

    res.json({
      success: true,
      message: `All student records have been deleted`,
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Clear all students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear all students",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Reset student view count
const resetStudentViewCount = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await student.resetViewCount();

    res.json({
      success: true,
      message: "Student view count reset successfully",
      data: {
        studentId: student.studentId,
        fullName: student.fullName,
        viewCount: student.viewCount,
        isViewLocked: student.isViewLocked,
      },
    });
  } catch (error) {
    console.error("Reset view count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset view count",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentDetails,
  uploadExcel,
  updateStudent,
  deleteStudent,
  getStatistics,
  bulkDelete,
  clearAllStudents,
  resetStudentViewCount,
};
