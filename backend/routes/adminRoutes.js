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
  resetStudentViewCount,
  getLockedDevices,
  unlockDevice,
  unlockAllDevices,
  deleteDevice,
} = require("../controllers/adminController");
const {
  uploadExcel: uploadMiddleware,
  handleUploadError,
} = require("../middleware/uploadMiddleware");
const {
  requireRole,
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
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
    .matches(/^[A-Za-z0-9\-\/\.\s]+$/)
    .withMessage(
      "Invalid student ID format - only letters, numbers, dashes, slashes, dots, and spaces allowed",
    ),
  body("department")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be 2-100 characters"),
  body("batch")
    .optional()
    .matches(/^\d{4}$/)
    .withMessage("Batch must be a 4-digit year"),
  body("email")
    .optional({ checkFalsy: true })
    .custom((value) => {
      // Allow N/A or empty values
      if (!value || value === "N/A" || value.trim() === "") {
        return true;
      }
      // Validate email format if provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
      }
      return true;
    }),
  body("phone")
    .optional({ checkFalsy: true })
    .custom((value) => {
      // Allow N/A or empty values
      if (!value || value === "N/A" || value.trim() === "") {
        return true;
      }
      // Validate phone format if provided
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(value)) {
        throw new Error("Invalid phone number format");
      }
      return true;
    }),
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
  [param("id").isInt().withMessage("Invalid student ID - must be a number")],
  getStudentDetails,
);

// @route   PUT /api/admin/students/:id
// @desc    Update student information
// @access  Private/Admin
router.put(
  "/students/:id",
  [param("id").isInt().withMessage("Invalid student ID - must be a number")],
  studentUpdateValidation,
  updateStudent,
);

// @route   DELETE /api/admin/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete(
  "/students/:id",
  [param("id").isInt().withMessage("Invalid student ID - must be a number")],
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

// @route   GET /api/admin/sample-files/:type
// @desc    Download sample Excel files
// @access  Private/Admin
router.get("/sample-files/:type", (req, res) => {
  const { type } = req.params;
  const path = require("path");

  let filename;
  let displayName;

  switch (type) {
    case "simple":
      filename = "sample_simple_results.xlsx";
      displayName = "Simple_Results_Template.xlsx";
      break;
    case "complete":
      filename = "sample_complete_students.xlsx";
      displayName = "Complete_Students_Template.xlsx";
      break;
    default:
      return res.status(404).json({
        success: false,
        message: "Sample file not found",
      });
  }

  const filePath = path.join(__dirname, "..", "uploads", filename);

  // Check if file exists
  const fs = require("fs");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Sample file not found",
    });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${displayName}"`);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.sendFile(filePath);
});

// @route   POST /api/admin/students/:studentId/reset-view-count
// @desc    Reset student view count
// @access  Private/Admin
router.post("/students/:studentId/reset-view-count", resetStudentViewCount);

// Device Management Routes

// @route   GET /api/admin/devices
// @desc    Get all devices (locked and unlocked)
// @access  Private/Admin
router.get("/devices", paginationValidation, getLockedDevices);

// @route   POST /api/admin/devices/:deviceId/unlock
// @desc    Unlock a specific device
// @access  Private/Admin
router.post(
  "/devices/:deviceId/unlock",
  [param("deviceId").notEmpty().withMessage("Device ID is required")],
  unlockDevice,
);

// @route   POST /api/admin/devices/unlock-all
// @desc    Unlock all locked devices
// @access  Private/Admin
router.post("/devices/unlock-all", unlockAllDevices);

// @route   DELETE /api/admin/devices/:deviceId
// @desc    Delete a device record
// @access  Private/Admin
router.delete(
  "/devices/:deviceId",
  [param("deviceId").notEmpty().withMessage("Device ID is required")],
  deleteDevice,
);

module.exports = router;
