const { sequelize, User, Student, Course, syncDatabase } = require("../models");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Sample data
const sampleUsers = [
  {
    username: "admin",
    email: "admin@studentresults.edu",
    password: "admin123",
    fullName: "System Administrator",
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

const departments = [
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
];

const courses = {
  "Computer Science": [
    { code: "CS101", name: "Introduction to Programming", credits: 3 },
    { code: "CS102", name: "Data Structures", credits: 4 },
    { code: "CS201", name: "Algorithms", credits: 3 },
    { code: "CS202", name: "Database Systems", credits: 4 },
    { code: "CS301", name: "Software Engineering", credits: 3 },
    { code: "CS302", name: "Computer Networks", credits: 3 },
  ],
  "Information Technology": [
    { code: "IT101", name: "IT Fundamentals", credits: 3 },
    { code: "IT102", name: "Web Development", credits: 4 },
    { code: "IT201", name: "System Administration", credits: 3 },
    { code: "IT202", name: "Network Security", credits: 4 },
    { code: "IT301", name: "Cloud Computing", credits: 3 },
    { code: "IT302", name: "Mobile Development", credits: 3 },
  ],
  "Software Engineering": [
    { code: "SE101", name: "Programming Principles", credits: 3 },
    { code: "SE102", name: "Software Design", credits: 4 },
    { code: "SE201", name: "Requirements Engineering", credits: 3 },
    { code: "SE202", name: "Software Testing", credits: 4 },
    { code: "SE301", name: "Project Management", credits: 3 },
    { code: "SE302", name: "DevOps Practices", credits: 3 },
  ],
};

const grades = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];
const gradeWeights = [
  0.05, 0.15, 0.2, 0.25, 0.2, 0.1, 0.03, 0.01, 0.005, 0.003, 0.002, 0.001,
];

// Helper functions
const getRandomGrade = () => {
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < grades.length; i++) {
    cumulative += gradeWeights[i];
    if (random <= cumulative) {
      return grades[i];
    }
  }
  return "C";
};

const generateStudentId = (department, batch, index) => {
  const deptCode = department
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${deptCode}-${batch}-${String(index).padStart(3, "0")}`;
};

const generateRandomMarks = () => {
  const quiz = Math.floor(Math.random() * 20) + 80; // 80-100
  const midterm = Math.floor(Math.random() * 20) + 75; // 75-95
  const assignment = Math.floor(Math.random() * 15) + 85; // 85-100
  const project = Math.floor(Math.random() * 20) + 80; // 80-100
  const final = Math.floor(Math.random() * 25) + 70; // 70-95

  const total = Math.round(
    quiz * 0.1 +
      midterm * 0.25 +
      assignment * 0.15 +
      project * 0.2 +
      final * 0.3,
  );

  return { quiz, midterm, assignment, project, final, total };
};

const generateSampleStudents = (adminUserId) => {
  const students = [];
  const batches = ["2020", "2021", "2022", "2023", "2024"];

  departments.slice(0, 3).forEach((department) => {
    batches.forEach((batch) => {
      const studentsPerBatch = Math.floor(Math.random() * 15) + 10; // 10-25 students per batch

      for (let i = 1; i <= studentsPerBatch; i++) {
        const studentId = generateStudentId(department, batch, i);
        const firstName = [
          "John",
          "Jane",
          "Michael",
          "Sarah",
          "David",
          "Emily",
          "Robert",
          "Lisa",
          "James",
          "Maria",
          "William",
          "Jennifer",
          "Richard",
          "Patricia",
          "Charles",
          "Linda",
          "Joseph",
          "Barbara",
          "Thomas",
          "Elizabeth",
          "Christopher",
          "Susan",
          "Daniel",
          "Jessica",
          "Matthew",
          "Karen",
          "Anthony",
          "Nancy",
          "Mark",
          "Betty",
        ][Math.floor(Math.random() * 30)];

        const lastName = [
          "Smith",
          "Johnson",
          "Williams",
          "Brown",
          "Jones",
          "Garcia",
          "Miller",
          "Davis",
          "Rodriguez",
          "Martinez",
          "Hernandez",
          "Lopez",
          "Gonzalez",
          "Wilson",
          "Anderson",
          "Thomas",
          "Taylor",
          "Moore",
          "Jackson",
          "Martin",
          "Lee",
          "Perez",
          "Thompson",
          "White",
          "Harris",
          "Sanchez",
          "Clark",
          "Ramirez",
          "Lewis",
          "Robinson",
        ][Math.floor(Math.random() * 30)];

        const fullName = `${firstName} ${lastName}`;

        // Generate courses for this student
        const studentCourses = [];
        const departmentCourses =
          courses[department] || courses["Computer Science"];

        // Each student takes 4-6 courses
        const numCourses = Math.floor(Math.random() * 3) + 4;
        const selectedCourses = departmentCourses
          .sort(() => 0.5 - Math.random())
          .slice(0, numCourses);

        selectedCourses.forEach((course) => {
          const grade = getRandomGrade();
          const gradePoints = Student.getGradePoints(grade);
          const marks = generateRandomMarks();

          studentCourses.push({
            courseCode: course.code,
            courseName: course.name,
            creditHours: course.credits,
            grade,
            gradePoints,
            quizMarks: marks.quiz,
            midtermMarks: marks.midterm,
            assignmentMarks: marks.assignment,
            projectMarks: marks.project,
            finalMarks: marks.final,
            totalMarks: marks.total,
          });
        });

        const student = {
          fullName,
          studentId,
          department,
          batch,
          semester: ["Fall", "Spring", "Summer"][Math.floor(Math.random() * 3)],
          academicYear: `${batch}-${parseInt(batch) + 1}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.edu`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          courses: studentCourses,
          status:
            Math.random() > 0.1
              ? "Active"
              : Math.random() > 0.5
                ? "Graduated"
                : "Suspended",
          uploadedBy: adminUserId,
        };

        students.push(student);
      }
    });
  });

  return students;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Sync database (recreate tables)
    console.log("🗄️  Synchronizing database...");
    await syncDatabase(true); // force: true to recreate tables

    // Create users
    console.log("👥 Creating users...");
    const users = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✅ Created user: ${userData.username}`);
    }

    // Create students
    console.log("🎓 Creating students...");
    const adminUser = users.find((u) => u.role === "admin");
    const sampleStudents = generateSampleStudents(adminUser.id);

    let createdCount = 0;
    for (const studentData of sampleStudents) {
      const transaction = await sequelize.transaction();

      try {
        // Extract courses from student data
        const courses = studentData.courses || [];
        delete studentData.courses;

        // Create student
        const student = await Student.create(studentData, { transaction });

        // Create courses for this student
        if (courses.length > 0) {
          const coursesWithStudentId = courses.map((course) => ({
            ...course,
            studentId: student.id,
          }));

          await Course.bulkCreate(coursesWithStudentId, { transaction });
        }

        // Calculate and update GPA
        await student.calculateGPA();
        await student.save({ transaction });

        await transaction.commit();
        createdCount++;

        if (createdCount % 10 === 0) {
          console.log(`   📊 Created ${createdCount} students...`);
        }
      } catch (error) {
        await transaction.rollback();
        console.error(
          `   ❌ Failed to create student ${studentData.studentId}:`,
          error.message,
        );
      }
    }

    console.log(`   ✅ Created ${createdCount} students total`);

    // Summary
    const totalUsers = await User.count();
    const totalStudents = await Student.count();
    const departmentCounts = await Student.findAll({
      attributes: [
        "department",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["department"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      raw: true,
    });

    console.log("\n📊 Seeding Summary:");
    console.log(`   👥 Users created: ${totalUsers}`);
    console.log(`   🎓 Students created: ${totalStudents}`);
    console.log("   📚 Students by department:");
    departmentCounts.forEach((dept) => {
      console.log(`      ${dept.department}: ${dept.count} students`);
    });

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n🔑 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Database connection closed");
  }
};

// Run seeding
const runSeed = async () => {
  await seedDatabase();
  process.exit(0);
};

// Handle command line execution
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase };
