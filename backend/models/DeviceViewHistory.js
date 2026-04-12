const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DeviceViewHistory = sequelize.define(
  "DeviceViewHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Device identifier",
    },
    studentId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Student ID that was viewed",
    },
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: "When the student result was viewed",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    tableName: "device_view_history",
    indexes: [
      {
        fields: ["deviceId"],
      },
      {
        fields: ["studentId"],
      },
      {
        fields: ["deviceId", "studentId"],
      },
    ],
  },
);

// Static method to log a view
DeviceViewHistory.logView = async function (deviceId, studentId, ipAddress) {
  return await this.create({
    deviceId,
    studentId,
    ipAddress,
    viewedAt: new Date(),
  });
};

// Static method to get devices that viewed a specific student
DeviceViewHistory.getDevicesByStudent = async function (studentId) {
  const { Op } = require("sequelize");

  // Search with partial matching (case-insensitive)
  // Will match if studentId contains the search term anywhere
  return await this.findAll({
    where: {
      studentId: {
        [Op.like]: `%${studentId}%`, // Partial match with wildcards
      },
    },
    order: [["viewedAt", "DESC"]],
  });
};

// Static method to get students viewed by a device
DeviceViewHistory.getStudentsByDevice = async function (deviceId) {
  return await this.findAll({
    where: { deviceId },
    order: [["viewedAt", "DESC"]],
  });
};

module.exports = DeviceViewHistory;
