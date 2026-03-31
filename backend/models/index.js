const { sequelize } = require("../config/database");
const User = require("./User");
const { Student, Course } = require("./Student");

// Define associations
User.hasMany(Student, { foreignKey: "uploadedBy", as: "uploadedStudents" });
Student.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Student,
  Course,
  syncDatabase,
};
