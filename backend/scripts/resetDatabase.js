const { sequelize, User, syncDatabase } = require("../models");
require("dotenv").config();

// Sample data
const sampleUsers = [
  {
    username: "abdulaki",
    email: "abdulakimustefa@gmail.com",
    password: "Alhamdulillaah##91",
    fullName: "Abdulaki Mustefa",
    role: "admin",
    department: "IT",
  },
  {
    username: "teacher1",
    email: "teacher1@studentresults.edu",
    password: "teacher123",
    fullName: "Dr. John Smith",
    role: "teacher",
    department: "Computer Science",
  },
];

// Reset database function - COMPLETELY WIPES ALL DATA
const resetDatabase = async () => {
  try {
    console.log("🚨 RESETTING DATABASE - ALL DATA WILL BE LOST!");
    console.log("🌱 Starting database reset...");

    // Sync database with force (recreate tables - DELETES ALL DATA)
    console.log("🗄️  Synchronizing database with FORCE (deleting all data)...");
    await syncDatabase(true); // force: true to recreate tables
    console.log("✅ Database synchronized successfully");

    // Initialize default column settings
    console.log("🔧 Initializing default column settings...");
    const { ColumnSetting } = require("../models");

    const defaultColumns = [
      // Student Info Columns
      {
        columnKey: "fullName",
        columnName: "Full Name",
        category: "student_info",
        displayOrder: 1,
        isVisible: true,
      },
      {
        columnKey: "studentId",
        columnName: "Student ID",
        category: "student_info",
        displayOrder: 2,
        isVisible: true,
      },
      {
        columnKey: "department",
        columnName: "Department",
        category: "student_info",
        displayOrder: 3,
        isVisible: true,
      },
      {
        columnKey: "batch",
        columnName: "Batch",
        category: "student_info",
        displayOrder: 4,
        isVisible: true,
      },
      {
        columnKey: "semester",
        columnName: "Semester",
        category: "student_info",
        displayOrder: 5,
        isVisible: true,
      },
      {
        columnKey: "academicYear",
        columnName: "Academic Year",
        category: "student_info",
        displayOrder: 6,
        isVisible: true,
      },
      {
        columnKey: "email",
        columnName: "Email",
        category: "student_info",
        displayOrder: 7,
        isVisible: false,
      },
      {
        columnKey: "phone",
        columnName: "Phone",
        category: "student_info",
        displayOrder: 8,
        isVisible: false,
      },

      // Course Marks Columns
      {
        columnKey: "courseCode",
        columnName: "Course",
        category: "course_marks",
        displayOrder: 1,
        isVisible: true,
      },
      {
        columnKey: "courseName",
        columnName: "Course Name",
        category: "course_marks",
        displayOrder: 2,
        isVisible: false,
      },
      {
        columnKey: "creditHours",
        columnName: "Credits",
        category: "course_marks",
        displayOrder: 3,
        isVisible: true,
      },
      {
        columnKey: "quiz",
        columnName: "Quiz",
        category: "course_marks",
        displayOrder: 4,
        isVisible: true,
      },
      {
        columnKey: "midterm",
        columnName: "Midterm",
        category: "course_marks",
        displayOrder: 5,
        isVisible: true,
      },
      {
        columnKey: "assignment",
        columnName: "Assignment",
        category: "course_marks",
        displayOrder: 6,
        isVisible: true,
      },
      {
        columnKey: "project",
        columnName: "Project",
        category: "course_marks",
        displayOrder: 7,
        isVisible: true,
      },
      {
        columnKey: "final",
        columnName: "Final",
        category: "course_marks",
        displayOrder: 8,
        isVisible: true,
      },
      {
        columnKey: "total",
        columnName: "Total",
        category: "course_marks",
        displayOrder: 9,
        isVisible: true,
      },
      {
        columnKey: "grade",
        columnName: "Grade",
        category: "course_marks",
        displayOrder: 10,
        isVisible: true,
      },
      {
        columnKey: "gradePoints",
        columnName: "Grade Points",
        category: "course_marks",
        displayOrder: 11,
        isVisible: false,
      },
    ];

    await ColumnSetting.bulkCreate(defaultColumns, {
      ignoreDuplicates: true,
    });
    console.log("✅ Default column settings initialized");

    // Create users
    console.log("👥 Creating users...");
    const users = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✅ Created user: ${userData.username}`);
    }

    // Summary
    const totalUsers = await User.count();

    console.log("\n📊 Reset Summary:");
    console.log(`   👥 Users created: ${totalUsers}`);
    console.log(`   🎓 Students created: 0 (empty database)`);

    console.log("\n🎉 Database reset completed successfully!");
    console.log("\n🔑 Login credentials:");
    console.log("   Username: abdulaki");
    console.log("   Password: Alhamdulillaah##91");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Database connection closed");
  }
};

// Run reset
const runReset = async () => {
  console.log("⚠️  WARNING: This will DELETE ALL DATA in the database!");
  console.log("⚠️  This includes all students, courses, and user data!");
  console.log("⚠️  Only admin and teacher accounts will be recreated.");
  console.log("\n🔄 Starting in 3 seconds...");

  // Give user time to cancel if run accidentally
  await new Promise((resolve) => setTimeout(resolve, 3000));

  await resetDatabase();
  process.exit(0);
};

// Handle command line execution
if (require.main === module) {
  runReset();
}

module.exports = { resetDatabase };
