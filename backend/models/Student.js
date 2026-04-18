const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Personal Information
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    // Academic Information
    studentId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[A-Za-z0-9\-\/\.\s]+$/, // Allow letters, numbers, dashes (single/double), slashes, dots, spaces
      },
    },
    department: {
      type: DataTypes.ENUM(
        "Computer Science",
        "Information Technology",
        "Software Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Business Administration",
        "Economics",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Other",
      ),
      allowNull: false,
    },
    batch: {
      type: DataTypes.STRING(4),
      allowNull: false,
      validate: {
        is: /^\d{4}$/,
      },
    },
    semester: {
      type: DataTypes.ENUM("Fall", "Spring", "Summer"),
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING(9),
      allowNull: false,
      validate: {
        is: /^\d{4}-\d{4}$/,
      },
    },
    // Contact Information
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "N/A",
      validate: {
        isValidEmail(value) {
          if (value && value !== "N/A" && value.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              throw new Error("Invalid email format");
            }
          }
        },
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "N/A",
      validate: {
        isValidPhone(value) {
          if (value && value !== "N/A" && value.trim() !== "") {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(value)) {
              throw new Error("Invalid phone format");
            }
          }
        },
      },
    },
    // Academic Performance
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 4,
      },
    },
    cgpa: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
        max: 4,
      },
    },
    totalCreditHours: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    completedCreditHours: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    // Status
    status: {
      type: DataTypes.ENUM("Active", "Graduated", "Suspended", "Withdrawn"),
      defaultValue: "Active",
    },
    // Metadata
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    // Assessment configuration used for this student's courses
    assessmentConfigId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "assessment_configs",
        key: "id",
      },
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Result viewing restrictions
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    maxViews: {
      type: DataTypes.INTEGER,
      defaultValue: 6,
      validate: {
        min: 1,
      },
    },
    isViewLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "students",
    hooks: {
      beforeSave: async (student) => {
        student.lastUpdated = new Date();
      },
    },
  },
);

// Course model for storing individual courses
const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "students",
        key: "id",
      },
    },
    courseCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    courseName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    creditHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6,
      },
    },
    grade: {
      type: DataTypes.ENUM(
        "A+",
        "A",
        "A-",
        "B+",
        "B",
        "B-",
        "C+",
        "C",
        "C-",
        "D",
        "Fx",
        "F",
        "I",
        "W",
        "N/A",
      ),
      allowNull: false,
      comment: "Grade must be uploaded - no automatic calculation",
    },
    gradePoints: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 4,
      },
    },
    // Marks breakdown (for reference only - grades are uploaded)
    quizMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Individual assessment marks for reference only",
    },
    midtermMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Individual assessment marks for reference only",
    },
    assignmentMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Individual assessment marks for reference only",
    },
    projectMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Individual assessment marks for reference only",
    },
    finalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Individual assessment marks for reference only",
    },
    totalMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: { min: 0, max: 100 },
      comment: "Total marks for reference only - grade is uploaded separately",
    },
    // Assessment configuration used (for reference)
    assessmentConfigId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "assessment_configs",
        key: "id",
      },
    },
  },
  {
    tableName: "courses",
  },
);

// Define associations
Student.hasMany(Course, { foreignKey: "studentId", as: "courses" });
Course.belongsTo(Student, { foreignKey: "studentId" });

// Static method to get grade points from letter grade
Student.getGradePoints = function (grade) {
  const gradeMap = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    D: 1.0,
    Fx: 0.0,
    F: 0.0,
    I: 0.0,
    W: 0.0,
    "N/A": 0.0, // No grade provided
  };
  return gradeMap[grade] || 0;
};

// Instance method to calculate GPA from uploaded grades
Student.prototype.calculateGPA = async function () {
  const courses = await Course.findAll({
    where: { studentId: this.id },
  });

  if (courses.length === 0) {
    this.gpa = 0;
    this.totalCreditHours = 0;
    this.completedCreditHours = 0;
    return;
  }

  let totalGradePoints = 0;
  let totalCreditHours = 0;
  let completedCreditHours = 0;

  courses.forEach((course) => {
    // Only use courses that have uploaded grades
    if (course.grade && course.grade !== "N/A") {
      totalGradePoints += course.gradePoints * course.creditHours;
      totalCreditHours += course.creditHours;

      if (!["F", "Fx", "I", "W"].includes(course.grade)) {
        completedCreditHours += course.creditHours;
      }
    }
  });

  this.gpa =
    totalCreditHours > 0
      ? parseFloat((totalGradePoints / totalCreditHours).toFixed(2))
      : 0.0;
  this.totalCreditHours = totalCreditHours;
  this.completedCreditHours = completedCreditHours;
};

// Instance method to get grade status
Student.prototype.getGradeStatus = function () {
  if (this.gpa >= 3.5) return "Excellent";
  if (this.gpa >= 3.0) return "Good";
  if (this.gpa >= 2.5) return "Satisfactory";
  if (this.gpa >= 2.0) return "Pass";
  return "Fail";
};

// Instance method to check if result viewing is locked
Student.prototype.isResultLocked = function () {
  return this.isViewLocked || this.viewCount >= this.maxViews;
};

// Instance method to increment view count
Student.prototype.incrementViewCount = async function () {
  this.viewCount += 1;
  this.lastViewedAt = new Date();

  // Lock if max views reached
  if (this.viewCount >= this.maxViews) {
    this.isViewLocked = true;
  }

  await this.save();
  return this.viewCount;
};

// Instance method to reset view count (admin only)
Student.prototype.resetViewCount = async function () {
  this.viewCount = 0;
  this.isViewLocked = false;
  this.lastViewedAt = null;
  await this.save();
};

// Instance method to get transcript
Student.prototype.getTranscript = async function () {
  const courses = await Course.findAll({
    where: { studentId: this.id },
    order: [["courseCode", "ASC"]],
  });

  return {
    studentInfo: {
      fullName: this.fullName,
      studentId: this.studentId,
      department: this.department,
      batch: this.batch,
      semester: this.semester,
      academicYear: this.academicYear,
      email: this.email,
      phone: this.phone,
    },
    courses: courses.map((course) => ({
      courseCode: course.courseCode,
      courseName: course.courseName,
      creditHours: course.creditHours,
      grade: course.grade,
      gradePoints: parseFloat(course.gradePoints) || 0,
      marks: {
        quiz: parseFloat(course.quizMarks) || 0,
        midterm: parseFloat(course.midtermMarks) || 0,
        assignment: parseFloat(course.assignmentMarks) || 0,
        project: parseFloat(course.projectMarks) || 0,
        final: parseFloat(course.finalMarks) || 0,
        total: parseFloat(course.totalMarks) || 0,
      },
    })),
    generatedAt: new Date(),
  };
};

module.exports = { Student, Course };
