const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ColumnSetting = sequelize.define(
  "ColumnSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    columnKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment:
        "Unique identifier for the column (e.g., fullName, studentId, quiz, etc.)",
    },
    columnName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Display name for the column",
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this column should be displayed",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Order in which columns should be displayed",
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether this column is required and cannot be hidden",
    },
    columnType: {
      type: DataTypes.ENUM("student_info", "marks", "calculated", "metadata"),
      defaultValue: "student_info",
      comment: "Category of the column",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Description of what this column represents",
    },
  },
  {
    tableName: "column_settings",
    timestamps: true,
    indexes: [
      {
        fields: ["columnKey"],
        unique: true,
      },
      {
        fields: ["displayOrder"],
      },
    ],
  },
);

module.exports = ColumnSetting;
