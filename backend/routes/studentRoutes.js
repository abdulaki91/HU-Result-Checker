const express = require("express");
const { param, query } = require("express-validator");
const {
  getStudentById,
  searchStudents,
  getFilters,
  validateStudentId,
} = require("../controllers/studentController");

const router = express.Router();

// Validation rules
const studentIdValidation = [
  param("studentId")
    .notEmpty()
    .withMessage("Student ID is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Student ID must be 1-50 characters")
    .matches(/^[A-Z0-9-/]+$/i)
    .withMessage(
      "Student ID can only contain letters, numbers, hyphens, and slashes",
    ),
];

const searchValidation = [
  query("q")
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be 2-100 characters")
    .trim(),
  query("department")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Department name too long"),
  query("batch")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("Batch must be a 4-digit year"),
];

// @route   GET /api/students/filters
// @desc    Get available departments and batches for filtering
// @access  Public
router.get("/filters", getFilters);

// @route   GET /api/students/search
// @desc    Search students by name or ID
// @access  Public
router.get("/search", searchValidation, searchStudents);

// @route   GET /api/students/validate/:studentId
// @desc    Validate student ID format and existence
// @access  Public
router.get("/validate/:studentId", studentIdValidation, validateStudentId);

// @route   GET /api/students/:studentId
// @desc    Get student result by ID
// @access  Public
router.get("/:studentId", studentIdValidation, getStudentById);

// @route   GET /api/students/:studentId/pdf

module.exports = router;
