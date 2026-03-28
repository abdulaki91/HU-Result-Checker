const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const config = require("./config");

class Database {
  constructor() {
    this.connection = null;
    this.students = [];
  }

  async initialize() {
    if (config.USE_JSON_STORAGE) {
      await this.initializeJsonStorage();
    } else {
      await this.initializeMySQL();
    }
  }

  async initializeMySQL() {
    try {
      // Create connection
      this.connection = await mysql.createConnection({
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
      });

      console.log("✅ Connected to MySQL database");

      // Create table if it doesn't exist
      await this.createStudentsTable();
      await this.createCourseSettingsTable();
      await this.createFeedbackTable();
    } catch (error) {
      console.error("❌ MySQL connection failed:", error.message);

      // Try to create database if it doesn't exist
      if (error.code === "ER_BAD_DB_ERROR") {
        await this.createDatabase();
        return this.initializeMySQL();
      }

      console.log("📝 Falling back to JSON storage...");
      config.USE_JSON_STORAGE = true;
      await this.initializeJsonStorage();
    }
  }

  async createDatabase() {
    try {
      const tempConnection = await mysql.createConnection({
        host: config.DB_HOST,
        port: config.DB_PORT,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
      });

      await tempConnection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${config.DB_NAME}\``,
      );
      await tempConnection.end();

      console.log(`✅ Database '${config.DB_NAME}' created`);
    } catch (error) {
      console.error("❌ Failed to create database:", error.message);
      throw error;
    }
  }

  async createStudentsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_id VARCHAR(100) NOT NULL UNIQUE,
        quiz DECIMAL(5,2) NOT NULL,
        mid DECIMAL(5,2) NOT NULL,
        assignment DECIMAL(5,2) NOT NULL,
        group_assignment DECIMAL(5,2) NOT NULL DEFAULT 0,
        project DECIMAL(5,2) NOT NULL DEFAULT 0,
        final DECIMAL(5,2) NOT NULL,
        total DECIMAL(6,2) NOT NULL,
        grade VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await this.connection.execute(createTableQuery);

      // Add new columns if they don't exist (for existing databases)
      await this.addNewColumnsIfNotExist();

      console.log("✅ Students table ready");
    } catch (error) {
      console.error("❌ Failed to create students table:", error.message);
      throw error;
    }
  }

  async addNewColumnsIfNotExist() {
    try {
      // Check if group_assignment column exists
      const [groupAssignmentExists] = await this.connection.execute(
        `
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'group_assignment'
      `,
        [config.DB_NAME],
      );

      if (groupAssignmentExists[0].count === 0) {
        await this.connection.execute(`
          ALTER TABLE students ADD COLUMN group_assignment DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER assignment
        `);
        console.log("✅ Added group_assignment column");
      }

      // Check if project column exists
      const [projectExists] = await this.connection.execute(
        `
        SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'students' AND COLUMN_NAME = 'project'
      `,
        [config.DB_NAME],
      );

      if (projectExists[0].count === 0) {
        await this.connection.execute(`
          ALTER TABLE students ADD COLUMN project DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER group_assignment
        `);
        console.log("✅ Added project column");
      }
    } catch (error) {
      console.error("❌ Failed to add new columns:", error.message);
    }
  }

  async createCourseSettingsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS course_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(255) DEFAULT 'Course Name',
        instructor_name VARCHAR(255) DEFAULT 'Instructor Name',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await this.connection.execute(createTableQuery);

      // Insert default values if table is empty
      const [rows] = await this.connection.execute(
        "SELECT COUNT(*) as count FROM course_settings",
      );
      if (rows[0].count === 0) {
        await this.connection.execute(`
          INSERT INTO course_settings (course_name, instructor_name) 
          VALUES ('Course Name', 'Instructor Name')
        `);
      }

      console.log("✅ Course settings table ready");
    } catch (error) {
      console.error(
        "❌ Failed to create course settings table:",
        error.message,
      );
    }
  }

  async initializeJsonStorage() {
    try {
      const dataDir = path.dirname(config.JSON_FILE_PATH);
      await fs.mkdir(dataDir, { recursive: true });

      try {
        const data = await fs.readFile(config.JSON_FILE_PATH, "utf8");
        this.students = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, create empty array
        this.students = [];
        await this.saveJsonData();
      }

      console.log("✅ JSON storage initialized");
    } catch (error) {
      console.error("❌ JSON storage initialization failed:", error.message);
      throw error;
    }
  }

  async saveJsonData() {
    try {
      await fs.writeFile(
        config.JSON_FILE_PATH,
        JSON.stringify(this.students, null, 2),
      );
    } catch (error) {
      console.error("❌ Failed to save JSON data:", error.message);
      throw error;
    }
  }

  async saveStudents(studentsData) {
    try {
      if (config.USE_JSON_STORAGE) {
        this.students = studentsData;
        await this.saveJsonData();
        console.log(`✅ Saved ${studentsData.length} students to JSON file`);
      } else {
        // Clear existing data
        await this.connection.execute("DELETE FROM students");

        // Prepare bulk insert
        if (studentsData.length > 0) {
          const insertQuery = `
            INSERT INTO students (student_name, student_id, quiz, mid, assignment, group_assignment, project, final, total, grade)
            VALUES ?
          `;

          const values = studentsData.map((student) => [
            student.studentName,
            student.studentId,
            student.quiz,
            student.mid,
            student.assignment,
            student.groupAssignment || null,
            student.project || null,
            student.final,
            student.total,
            student.grade,
          ]);

          await this.connection.query(insertQuery, [values]);
        }

        console.log(
          `✅ Saved ${studentsData.length} students to MySQL database`,
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to save students:", error.message);
      throw error;
    }
  }

  async findStudentById(studentId) {
    try {
      const searchId = studentId.toString().trim();

      // Import validators to check format
      const Validators = require("./src/utils/validators");

      // Only proceed if the ID is in the correct format
      if (!Validators.isValidStudentIdForSearch(searchId)) {
        return null;
      }

      if (config.USE_JSON_STORAGE) {
        // Try exact match first
        let student = this.students.find(
          (student) => student.studentId.toString().trim() === searchId,
        );

        // If no exact match, try flexible matching against stored IDs
        if (!student) {
          student = this.students.find((student) => {
            const storedId = student.studentId.toString().trim();

            // Check if stored ID ends with the search pattern
            // Example: GPR0014/14 matches search 0014/14
            if (storedId.endsWith(searchId)) {
              return true;
            }

            // Check if stored ID contains the search pattern after removing common prefixes
            const prefixes = ["GPR", "STU", "REG", "STD", "ST", "ID"];
            for (const prefix of prefixes) {
              if (storedId.toUpperCase().startsWith(prefix)) {
                const withoutPrefix = storedId.substring(prefix.length);
                if (withoutPrefix === searchId) {
                  return true;
                }
              }
            }

            return false;
          });
        }

        // Ensure new columns exist in JSON data
        if (student) {
          student.groupAssignment = student.groupAssignment || null;
          student.project = student.project || null;
        }

        return student;
      } else {
        // Try exact match first
        let [rows] = await this.connection.execute(
          "SELECT * FROM students WHERE student_id = ?",
          [searchId],
        );

        // If no exact match, try flexible matching
        if (rows.length === 0) {
          [rows] = await this.connection.execute(
            `SELECT * FROM students WHERE 
             student_id LIKE ? OR 
             (student_id LIKE 'GPR%' AND RIGHT(student_id, ?) = ?) OR
             (student_id LIKE 'STU%' AND RIGHT(student_id, ?) = ?) OR
             (student_id LIKE 'REG%' AND RIGHT(student_id, ?) = ?) OR
             (student_id LIKE 'STD%' AND RIGHT(student_id, ?) = ?) OR
             (student_id LIKE 'ST%' AND RIGHT(student_id, ?) = ?) OR
             (student_id LIKE 'ID%' AND RIGHT(student_id, ?) = ?)`,
            [
              `%${searchId}`,
              searchId.length,
              searchId,
              searchId.length,
              searchId,
              searchId.length,
              searchId,
              searchId.length,
              searchId,
              searchId.length,
              searchId,
              searchId.length,
              searchId,
            ],
          );
        }

        if (rows.length > 0) {
          const row = rows[0];
          return {
            studentName: row.student_name,
            studentId: row.student_id,
            quiz: parseFloat(row.quiz),
            mid: parseFloat(row.mid),
            assignment: parseFloat(row.assignment),
            groupAssignment: row.group_assignment
              ? parseFloat(row.group_assignment)
              : null,
            project: row.project ? parseFloat(row.project) : null,
            final: parseFloat(row.final),
            total: parseFloat(row.total),
            grade: row.grade,
          };
        }

        return null;
      }
    } catch (error) {
      console.error("❌ Failed to find student:", error.message);
      throw error;
    }
  }

  async getStudentCount() {
    try {
      if (config.USE_JSON_STORAGE) {
        return this.students.length;
      } else {
        const [rows] = await this.connection.execute(
          "SELECT COUNT(*) as count FROM students",
        );
        return rows[0].count;
      }
    } catch (error) {
      console.error("❌ Failed to get student count:", error.message);
      return 0;
    }
  }

  async testConnection() {
    try {
      if (config.USE_JSON_STORAGE) {
        return { status: "connected", type: "JSON File" };
      } else {
        await this.connection.ping();
        return { status: "connected", type: "MySQL" };
      }
    } catch (error) {
      return {
        status: "disconnected",
        type: config.USE_JSON_STORAGE ? "JSON File" : "MySQL",
        error: error.message,
      };
    }
  }

  async getAvailableColumns() {
    try {
      if (config.USE_JSON_STORAGE) {
        // For JSON storage, return standard columns that might exist
        if (this.students.length > 0) {
          const firstStudent = this.students[0];
          const columns = Object.keys(firstStudent).filter(
            (key) => key !== "studentName" && key !== "studentId",
          );
          return columns;
        }
        return [
          "quiz",
          "mid",
          "assignment",
          "groupAssignment",
          "project",
          "final",
          "total",
          "grade",
        ];
      } else {
        // For MySQL, get actual columns from the table
        const [rows] = await this.connection.execute("DESCRIBE students");

        const columns = rows
          .map((row) => row.Field)
          .filter(
            (field) =>
              field !== "id" &&
              field !== "student_name" &&
              field !== "student_id" &&
              field !== "created_at" &&
              field !== "updated_at",
          )
          .map((field) => {
            // Convert database field names to internal names
            if (field === "student_name") return "studentName";
            if (field === "student_id") return "studentId";
            if (field === "group_assignment") return "groupAssignment";
            return field;
          });

        return columns;
      }
    } catch (error) {
      console.error("❌ Failed to get available columns:", error.message);
      return [
        "quiz",
        "mid",
        "assignment",
        "groupAssignment",
        "project",
        "final",
        "total",
        "grade",
      ];
    }
  }

  async getColumnSettings() {
    try {
      if (config.USE_JSON_STORAGE) {
        // For JSON storage, use a settings file
        const settingsPath = "./data/column_settings.json";
        try {
          const data = await fs.readFile(settingsPath, "utf8");
          const settings = JSON.parse(data);

          // Ensure new columns are included with default values
          if (!settings.hasOwnProperty("groupAssignment")) {
            settings.groupAssignment = true;
          }
          if (!settings.hasOwnProperty("project")) {
            settings.project = true;
          }

          return settings;
        } catch (error) {
          // Return default settings if file doesn't exist
          return {
            quiz: true,
            mid: true,
            assignment: true,
            groupAssignment: true,
            project: true,
            final: true,
            total: true,
            grade: true,
          };
        }
      } else {
        // For MySQL, create a settings table if it doesn't exist
        await this.createColumnSettingsTable();

        const [rows] = await this.connection.execute(
          "SELECT column_name, is_visible FROM column_settings",
        );

        const settings = {};
        rows.forEach((row) => {
          settings[row.column_name] = row.is_visible === 1;
        });

        // If no settings exist, return defaults
        if (Object.keys(settings).length === 0) {
          return {
            quiz: true,
            mid: true,
            assignment: true,
            groupAssignment: true,
            project: true,
            final: true,
            total: true,
            grade: true,
          };
        }

        return settings;
      }
    } catch (error) {
      console.error("❌ Failed to get column settings:", error.message);
      return {
        quiz: true,
        mid: true,
        assignment: true,
        groupAssignment: true,
        project: true,
        final: true,
        total: true,
        grade: true,
      };
    }
  }

  async createColumnSettingsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS column_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        column_name VARCHAR(50) NOT NULL UNIQUE,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    try {
      await this.connection.execute(createTableQuery);
    } catch (error) {
      console.error(
        "❌ Failed to create column settings table:",
        error.message,
      );
    }
  }

  async toggleColumnVisibility(columnName) {
    try {
      if (config.USE_JSON_STORAGE) {
        const settingsPath = "./data/column_settings.json";
        let settings = {};

        try {
          const data = await fs.readFile(settingsPath, "utf8");
          settings = JSON.parse(data);
        } catch (error) {
          // File doesn't exist, start with defaults
          settings = {
            quiz: true,
            mid: true,
            assignment: true,
            groupAssignment: true,
            project: true,
            final: true,
            total: true,
            grade: true,
          };
        }

        // Toggle the column visibility
        settings[columnName] = !settings[columnName];

        // Save back to file
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
      } else {
        await this.createColumnSettingsTable();

        // Check if setting exists
        const [existing] = await this.connection.execute(
          "SELECT is_visible FROM column_settings WHERE column_name = ?",
          [columnName],
        );

        if (existing.length > 0) {
          // Toggle existing setting
          const newValue = !existing[0].is_visible;
          await this.connection.execute(
            "UPDATE column_settings SET is_visible = ? WHERE column_name = ?",
            [newValue, columnName],
          );
        } else {
          // Create new setting (default is true, so toggle to false)
          await this.connection.execute(
            "INSERT INTO column_settings (column_name, is_visible) VALUES (?, ?)",
            [columnName, false],
          );
        }
      }
    } catch (error) {
      console.error("❌ Failed to toggle column visibility:", error.message);
      throw error;
    }
  }

  async resetColumnSettings() {
    try {
      if (config.USE_JSON_STORAGE) {
        const settingsPath = "./data/column_settings.json";
        const defaultSettings = {
          quiz: true,
          mid: true,
          assignment: true,
          groupAssignment: true,
          project: true,
          final: true,
          total: true,
          grade: true,
        };

        await fs.writeFile(
          settingsPath,
          JSON.stringify(defaultSettings, null, 2),
        );
      } else {
        await this.createColumnSettingsTable();

        // Delete all settings (will use defaults)
        await this.connection.execute("DELETE FROM column_settings");
      }
    } catch (error) {
      console.error("❌ Failed to reset column settings:", error.message);
      throw error;
    }
  }

  async getCourseSettings() {
    try {
      if (config.USE_JSON_STORAGE) {
        const settingsPath = "./data/course_settings.json";
        try {
          const data = await fs.readFile(settingsPath, "utf8");
          return JSON.parse(data);
        } catch (error) {
          // Return default settings if file doesn't exist
          return {
            courseName: "Course Name",
            instructorName: "Instructor Name",
          };
        }
      } else {
        await this.createCourseSettingsTable();

        const [rows] = await this.connection.execute(
          "SELECT course_name, instructor_name FROM course_settings LIMIT 1",
        );

        if (rows.length > 0) {
          return {
            courseName: rows[0].course_name,
            instructorName: rows[0].instructor_name,
          };
        }

        // Return defaults if no settings exist
        return {
          courseName: "Course Name",
          instructorName: "Instructor Name",
        };
      }
    } catch (error) {
      console.error("❌ Failed to get course settings:", error.message);
      return {
        courseName: "Course Name",
        instructorName: "Instructor Name",
      };
    }
  }

  async updateCourseSettings(courseName, instructorName) {
    try {
      if (config.USE_JSON_STORAGE) {
        const settingsPath = "./data/course_settings.json";
        const settings = {
          courseName: courseName || "Course Name",
          instructorName: instructorName || "Instructor Name",
        };

        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
      } else {
        await this.createCourseSettingsTable();

        // Update or insert course settings
        await this.connection.execute(
          `
          UPDATE course_settings SET 
            course_name = ?, 
            instructor_name = ?, 
            updated_at = CURRENT_TIMESTAMP
        `,
          [courseName || "Course Name", instructorName || "Instructor Name"],
        );
      }
    } catch (error) {
      console.error("❌ Failed to update course settings:", error.message);
      throw error;
    }
  }

  async close() {
    if (!config.USE_JSON_STORAGE && this.connection) {
      await this.connection.end();
      console.log("📴 MySQL connection closed");
    }
  }

  // Feedback methods
  async createFeedbackTable() {
    if (config.USE_JSON_STORAGE) {
      // For JSON storage, feedback will be stored in a separate file
      return;
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        student_id VARCHAR(20) NULL,
        user_name VARCHAR(255) NOT NULL,
        user_username VARCHAR(255) NULL,
        message TEXT NOT NULL,
        replied BOOLEAN DEFAULT FALSE,
        replied_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_replied (replied)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await this.connection.execute(createTableQuery);
    console.log("✅ Feedback table created/verified");
  }

  async saveFeedback(feedbackData) {
    if (config.USE_JSON_STORAGE) {
      return await this.saveFeedbackJson(feedbackData);
    } else {
      return await this.saveFeedbackMySQL(feedbackData);
    }
  }

  async saveFeedbackJson(feedbackData) {
    try {
      // Load existing feedback
      let feedbackList = [];
      const feedbackPath = path.join(__dirname, "data/feedback.json");

      if (fsSync.existsSync(feedbackPath)) {
        const feedbackContent = fsSync.readFileSync(feedbackPath, "utf8");
        feedbackList = JSON.parse(feedbackContent);
      }

      // Add new feedback with ID
      const newFeedback = {
        id: feedbackList.length + 1,
        ...feedbackData,
        created_at: feedbackData.created_at.toISOString(),
      };

      feedbackList.push(newFeedback);

      // Save back to file
      fsSync.writeFileSync(feedbackPath, JSON.stringify(feedbackList, null, 2));
      console.log("✅ Feedback saved to JSON file");

      return newFeedback;
    } catch (error) {
      console.error("❌ Error saving feedback to JSON:", error.message);
      throw error;
    }
  }

  async saveFeedbackMySQL(feedbackData) {
    try {
      const insertQuery = `
        INSERT INTO feedback (user_id, student_id, user_name, user_username, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await this.connection.execute(insertQuery, [
        feedbackData.user_id,
        feedbackData.student_id,
        feedbackData.user_name,
        feedbackData.user_username,
        feedbackData.message,
        feedbackData.created_at,
      ]);

      console.log("✅ Feedback saved to MySQL");
      return { id: result.insertId, ...feedbackData };
    } catch (error) {
      console.error("❌ Error saving feedback to MySQL:", error.message);
      throw error;
    }
  }

  async getRecentFeedback(limit = 10) {
    if (config.USE_JSON_STORAGE) {
      return await this.getRecentFeedbackJson(limit);
    } else {
      return await this.getRecentFeedbackMySQL(limit);
    }
  }

  async getRecentFeedbackJson(limit = 10) {
    try {
      const feedbackPath = path.join(__dirname, "data/feedback.json");

      if (!fsSync.existsSync(feedbackPath)) {
        return [];
      }

      const feedbackContent = fsSync.readFileSync(feedbackPath, "utf8");
      const feedbackList = JSON.parse(feedbackContent);

      // Sort by created_at descending and limit
      return feedbackList
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
    } catch (error) {
      console.error("❌ Error reading feedback from JSON:", error.message);
      return [];
    }
  }

  async getRecentFeedbackMySQL(limit = 10) {
    try {
      const selectQuery = `
        SELECT * FROM feedback 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      const [rows] = await this.connection.execute(selectQuery, [limit]);
      console.log(`📊 Retrieved ${rows.length} feedback entries from MySQL`);

      return rows;
    } catch (error) {
      console.error("❌ Error reading feedback from MySQL:", error.message);
      return [];
    }
  }

  async getFeedbackById(feedbackId) {
    if (config.USE_JSON_STORAGE) {
      return await this.getFeedbackByIdJson(feedbackId);
    } else {
      return await this.getFeedbackByIdMySQL(feedbackId);
    }
  }

  async getFeedbackByIdJson(feedbackId) {
    try {
      const feedbackPath = path.join(__dirname, "data/feedback.json");

      if (!fsSync.existsSync(feedbackPath)) {
        return null;
      }

      const feedbackContent = fsSync.readFileSync(feedbackPath, "utf8");
      const feedbackList = JSON.parse(feedbackContent);

      return feedbackList.find((feedback) => feedback.id == feedbackId) || null;
    } catch (error) {
      console.error(
        "❌ Error reading feedback by ID from JSON:",
        error.message,
      );
      return null;
    }
  }

  async getFeedbackByIdMySQL(feedbackId) {
    try {
      const selectQuery = `SELECT * FROM feedback WHERE id = ?`;
      const [rows] = await this.connection.execute(selectQuery, [feedbackId]);

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(
        "❌ Error reading feedback by ID from MySQL:",
        error.message,
      );
      return null;
    }
  }

  async markFeedbackAsReplied(feedbackId) {
    if (config.USE_JSON_STORAGE) {
      return await this.markFeedbackAsRepliedJson(feedbackId);
    } else {
      return await this.markFeedbackAsRepliedMySQL(feedbackId);
    }
  }

  async markFeedbackAsRepliedJson(feedbackId) {
    try {
      const feedbackPath = path.join(__dirname, "data/feedback.json");

      if (!fsSync.existsSync(feedbackPath)) {
        return false;
      }

      const feedbackContent = fsSync.readFileSync(feedbackPath, "utf8");
      const feedbackList = JSON.parse(feedbackContent);

      const feedbackIndex = feedbackList.findIndex(
        (feedback) => feedback.id == feedbackId,
      );
      if (feedbackIndex === -1) {
        return false;
      }

      feedbackList[feedbackIndex].replied = true;
      feedbackList[feedbackIndex].replied_at = new Date().toISOString();

      fsSync.writeFileSync(feedbackPath, JSON.stringify(feedbackList, null, 2));
      console.log("✅ Feedback marked as replied in JSON");

      return true;
    } catch (error) {
      console.error(
        "❌ Error marking feedback as replied in JSON:",
        error.message,
      );
      return false;
    }
  }

  async markFeedbackAsRepliedMySQL(feedbackId) {
    try {
      const updateQuery = `
        UPDATE feedback 
        SET replied = TRUE, replied_at = NOW() 
        WHERE id = ?
      `;

      const [result] = await this.connection.execute(updateQuery, [feedbackId]);
      console.log("✅ Feedback marked as replied in MySQL");

      return result.affectedRows > 0;
    } catch (error) {
      console.error(
        "❌ Error marking feedback as replied in MySQL:",
        error.message,
      );
      return false;
    }
  }
}

module.exports = { Database };
