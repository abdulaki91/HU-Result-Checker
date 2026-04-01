const express = require("express");
const { ColumnSetting } = require("../models");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to require admin role
const requireAdmin = requireRole("admin");

// Get all column settings
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const columnSettings = await ColumnSetting.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["columnName", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: columnSettings,
    });
  } catch (error) {
    console.error("❌ Error fetching column settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch column settings",
      error: error.message,
    });
  }
});

// Get visible columns only (for public student search)
router.get("/visible", async (req, res) => {
  try {
    const visibleColumns = await ColumnSetting.findAll({
      where: { isVisible: true },
      order: [
        ["displayOrder", "ASC"],
        ["columnName", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: visibleColumns,
    });
  } catch (error) {
    console.error("❌ Error fetching visible columns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch visible columns",
      error: error.message,
    });
  }
});

// Update column settings
router.put("/bulk", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { columns } = req.body;

    if (!Array.isArray(columns)) {
      return res.status(400).json({
        success: false,
        message: "Columns must be an array",
      });
    }

    // Validate that required columns cannot be hidden
    const requiredColumns = columns.filter(
      (col) => col.isRequired && !col.isVisible,
    );
    if (requiredColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required columns cannot be hidden: ${requiredColumns.map((c) => c.columnName).join(", ")}`,
      });
    }

    // Update each column setting
    const updatePromises = columns.map(async (column) => {
      const { id, isVisible, displayOrder, columnName } = column;

      return await ColumnSetting.update(
        {
          isVisible,
          displayOrder,
          columnName: columnName || column.columnName,
        },
        { where: { id } },
      );
    });

    await Promise.all(updatePromises);

    // Fetch updated settings
    const updatedSettings = await ColumnSetting.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["columnName", "ASC"],
      ],
    });

    res.json({
      success: true,
      message: "Column settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    console.error("❌ Error updating column settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update column settings",
      error: error.message,
    });
  }
});

// Update single column setting
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible, displayOrder, columnName } = req.body;

    const columnSetting = await ColumnSetting.findByPk(id);
    if (!columnSetting) {
      return res.status(404).json({
        success: false,
        message: "Column setting not found",
      });
    }

    // Check if trying to hide a required column
    if (columnSetting.isRequired && isVisible === false) {
      return res.status(400).json({
        success: false,
        message: "Cannot hide required columns",
      });
    }

    await columnSetting.update({
      isVisible: isVisible !== undefined ? isVisible : columnSetting.isVisible,
      displayOrder:
        displayOrder !== undefined ? displayOrder : columnSetting.displayOrder,
      columnName: columnName || columnSetting.columnName,
    });

    res.json({
      success: true,
      message: "Column setting updated successfully",
      data: columnSetting,
    });
  } catch (error) {
    console.error("❌ Error updating column setting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update column setting",
      error: error.message,
    });
  }
});

// Reset to default settings
router.post("/reset", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Delete all existing settings
    await ColumnSetting.destroy({ where: {} });

    // Recreate default settings
    const defaultColumns = [
      // Student Info
      {
        columnKey: "fullName",
        columnName: "Student Name",
        isVisible: true,
        displayOrder: 1,
        isRequired: true,
        columnType: "student_info",
        description: "Full name of the student",
      },
      {
        columnKey: "studentId",
        columnName: "Student ID",
        isVisible: true,
        displayOrder: 2,
        isRequired: true,
        columnType: "student_info",
        description: "Unique student identifier",
      },
      {
        columnKey: "department",
        columnName: "Department",
        isVisible: true,
        displayOrder: 3,
        isRequired: false,
        columnType: "student_info",
        description: "Student department",
      },
      {
        columnKey: "batch",
        columnName: "Batch",
        isVisible: true,
        displayOrder: 4,
        isRequired: false,
        columnType: "student_info",
        description: "Student batch year",
      },
      {
        columnKey: "semester",
        columnName: "Semester",
        isVisible: false,
        displayOrder: 5,
        isRequired: false,
        columnType: "student_info",
        description: "Current semester",
      },
      {
        columnKey: "email",
        columnName: "Email",
        isVisible: false,
        displayOrder: 6,
        isRequired: false,
        columnType: "student_info",
        description: "Student email address",
      },
      {
        columnKey: "phone",
        columnName: "Phone",
        isVisible: false,
        displayOrder: 7,
        isRequired: false,
        columnType: "student_info",
        description: "Student phone number",
      },

      // Marks
      {
        columnKey: "quiz",
        columnName: "Quiz (5%)",
        isVisible: true,
        displayOrder: 8,
        isRequired: false,
        columnType: "marks",
        description: "Quiz marks out of total percentage",
      },
      {
        columnKey: "midterm",
        columnName: "Mid (30%)",
        isVisible: true,
        displayOrder: 9,
        isRequired: false,
        columnType: "marks",
        description: "Midterm exam marks",
      },
      {
        columnKey: "assignment",
        columnName: "Assignment (15%)",
        isVisible: true,
        displayOrder: 10,
        isRequired: false,
        columnType: "marks",
        description: "Assignment marks",
      },
      {
        columnKey: "project",
        columnName: "Project (20%)",
        isVisible: true,
        displayOrder: 11,
        isRequired: false,
        columnType: "marks",
        description: "Project marks",
      },
      {
        columnKey: "final",
        columnName: "Final (50%)",
        isVisible: true,
        displayOrder: 12,
        isRequired: false,
        columnType: "marks",
        description: "Final exam marks",
      },
      {
        columnKey: "total",
        columnName: "Total",
        isVisible: true,
        displayOrder: 13,
        isRequired: false,
        columnType: "calculated",
        description: "Total marks calculated from components",
      },
      {
        columnKey: "grade",
        columnName: "Grade",
        isVisible: true,
        displayOrder: 14,
        isRequired: false,
        columnType: "calculated",
        description: "Letter grade based on total marks",
      },
      {
        columnKey: "gpa",
        columnName: "GPA",
        isVisible: true,
        displayOrder: 15,
        isRequired: false,
        columnType: "calculated",
        description: "Grade Point Average for this course",
      },

      // Metadata
      {
        columnKey: "academicYear",
        columnName: "Academic Year",
        isVisible: false,
        displayOrder: 16,
        isRequired: false,
        columnType: "metadata",
        description: "Academic year",
      },
      {
        columnKey: "status",
        columnName: "Status",
        isVisible: false,
        displayOrder: 17,
        isRequired: false,
        columnType: "metadata",
        description: "Student status (active, inactive, etc.)",
      },
      {
        columnKey: "createdAt",
        columnName: "Created Date",
        isVisible: false,
        displayOrder: 18,
        isRequired: false,
        columnType: "metadata",
        description: "Date when record was created",
      },
      {
        columnKey: "updatedAt",
        columnName: "Updated Date",
        isVisible: false,
        displayOrder: 19,
        isRequired: false,
        columnType: "metadata",
        description: "Date when record was last updated",
      },
    ];

    const newSettings = await ColumnSetting.bulkCreate(defaultColumns);

    res.json({
      success: true,
      message: "Column settings reset to defaults",
      data: newSettings,
    });
  } catch (error) {
    console.error("❌ Error resetting column settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset column settings",
      error: error.message,
    });
  }
});

module.exports = router;
