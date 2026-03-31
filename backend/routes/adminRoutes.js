const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getAllStudents,
  getStudentDetails,
  uploadExcel,
  updateStudent,
  deleteStudent,
  getStatistics,
  bulkDelete,
  clearAllStudents,
} = require("../controllers/adminController");
const {
  uploadExcel: uploadMiddleware,
  handleUploadError,
} = require("../middleware/uploadMiddleware");
const { requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require admin role
router.use(requireRole(["admin"]));

// Validation rules
const studentUpdateValidation = [
  body("fullName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be 2-100 characters")
    .trim(),
  body("studentId")
    .optional()
    .matches(/^[A-Z0-9-/]+$/)
    .withMessage("Invalid student ID format"),
  body("department")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be 2-100 characters"),
  body("batch")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("Batch must be a 4-digit year"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage("Invalid phone number format"),
];

const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const bulkDeleteValidation = [
  body("studentIds")
    .isArray({ min: 1 })
    .withMessage("Student IDs array is required")
    .custom((value) => {
      if (!value.every((id) => typeof id === "string" && id.length > 0)) {
        throw new Error("All student IDs must be valid strings");
      }
      return true;
    }),
];

// @route   GET /api/admin/statistics
// @desc    Get system statistics
// @access  Private/Admin
router.get("/statistics", getStatistics);

// @route   GET /api/admin/students
// @desc    Get all students with pagination and filters
// @access  Private/Admin
router.get("/students", paginationValidation, getAllStudents);

// @route   GET /api/admin/students/:id
// @desc    Get student details by ID
// @access  Private/Admin
router.get(
  "/students/:id",
  [param("id").isMongoId().withMessage("Invalid student ID")],
  getStudentDetails,
);

// @route   PUT /api/admin/students/:id
// @desc    Update student information
// @access  Private/Admin
router.put(
  "/students/:id",
  [param("id").isMongoId().withMessage("Invalid student ID")],
  studentUpdateValidation,
  updateStudent,
);

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete(
  "/students/:id",
  [param("id").isMongoId().withMessage("Invalid student ID")],
  deleteStudent,
);

// @route   DELETE /api/admin/students/bulk
// @desc    Bulk delete students
// @access  Private/Admin
router.delete("/students/bulk", bulkDeleteValidation, bulkDelete);

// @route   DELETE /api/admin/students/clear-all
// @desc    Clear all students (with confirmation)
// @access  Private/Admin
router.delete(
  "/students/clear-all",
  [
    body("confirmation")
      .equals("DELETE_ALL_STUDENTS")
      .withMessage('Confirmation must be "DELETE_ALL_STUDENTS"'),
  ],
  clearAllStudents,
);

// @route   POST /api/admin/upload
// @desc    Upload Excel file and import students
// @access  Private/Admin
router.post("/upload", uploadMiddleware, handleUploadError, uploadExcel);

module.exports = router;
