const mysql = require("mysql2/promise");
const config = require("./config");

async function setupDatabase() {
  let connection = null;

  try {
    console.log("🔄 Setting up MySQL database...");

    // Connect without specifying database
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
    });

    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\``,
    );
    console.log(`✅ Database '${config.DB_NAME}' created/verified`);

    // Switch to the database
    await connection.execute(`USE \`${config.DB_NAME}\``);

    // Create students table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_id VARCHAR(100) NOT NULL UNIQUE,
        quiz DECIMAL(5,2) NOT NULL,
        mid DECIMAL(5,2) NOT NULL,
        assignment DECIMAL(5,2) NOT NULL,
        final DECIMAL(5,2) NOT NULL,
        total DECIMAL(6,2) NOT NULL,
        grade VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.execute(createTableQuery);
    console.log("✅ Students table created/verified");

    // Insert sample data (optional)
    const sampleData = [
      ["John Doe", "ST001", 85, 78, 92, 88, 343, "A"],
      ["Jane Smith", "ST002", 90, 82, 88, 91, 351, "A"],
      ["Bob Johnson", "ST003", 75, 70, 80, 76, 301, "B"],
    ];

    // Check if table is empty
    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as count FROM students",
    );

    if (countResult[0].count === 0) {
      const insertQuery = `
        INSERT INTO students (student_name, student_id, quiz, mid, assignment, final, total, grade)
        VALUES ?
      `;

      await connection.query(insertQuery, [sampleData]);
      console.log("✅ Sample data inserted");
    } else {
      console.log(
        `📊 Database already contains ${countResult[0].count} students`,
      );
    }

    console.log("🎉 Database setup completed successfully!");

    // Test the setup
    const [students] = await connection.execute(
      "SELECT * FROM students LIMIT 3",
    );
    console.log("\n📋 Sample students in database:");
    students.forEach((student) => {
      console.log(
        `   ${student.student_name} (${student.student_id}) - Grade: ${student.grade}`,
      );
    });
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 Please check your MySQL credentials in .env file");
    } else if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Please make sure MySQL server is running");
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
