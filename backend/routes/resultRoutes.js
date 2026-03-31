const express = require("express");
const { param } = require("express-validator");
const {
  getStudentById,
  downloadResultPDF,
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

// @route   GET /api/results/:studentId
// @desc    Get student result by ID (alias for students route)
// @access  Public
router.get("/:studentId", studentIdValidation, getStudentById);

// @route   GET /api/results/:studentId/transcript
// @desc    Download student transcript as PDF
// @access  Public
router.get("/:studentId/transcript", studentIdValidation, downloadResultPDF);

module.exports = router;
