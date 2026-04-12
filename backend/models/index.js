const { sequelize, testConnection } = require("../config/database");
const User = require("./User");
const { Student, Course } = require("./Student");
const ColumnSetting = require("./ColumnSetting");
const DeviceView = require("./DeviceView");

// Define associations
User.hasMany(Student, { foreignKey: "uploadedBy", as: "uploadedStudents" });
Student.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized successfully");

    // Initialize default column settings if they don't exist
    await initializeDefaultColumnSettings();
  } catch (error) {
    console.error("❌ Database synchronization failed:", error.message);
    throw error;
  }
};

// Initialize default column settings
const initializeDefaultColumnSettings = async () => {
  try {
    const existingSettings = await ColumnSetting.count();
    if (existingSettings === 0) {
      console.log("🔧 Initializing default column settings...");

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

      await ColumnSetting.bulkCreate(defaultColumns);
      console.log("✅ Default column settings initialized");
    }
  } catch (error) {
    console.error("❌ Failed to initialize column settings:", error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  Student,
  Course,
  ColumnSetting,
  DeviceView,
  syncDatabase,
};
