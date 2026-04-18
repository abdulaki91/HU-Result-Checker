const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * AssessmentConfig Model
 * Stores the assessment breakdown/weighting for courses (for reference only)
 * Grades are now uploaded directly and not calculated from individual marks
 * This model maintains historical assessment structure information
 * Example: Quiz 10%, Midterm 20%, Assignment 15%, Project 15%, Final 40%
 */
const AssessmentConfig = sequelize.define(
  "AssessmentConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Identifier for this configuration (e.g., "default", "2024-CS", "2023-IT")
    configName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      defaultValue: "default",
    },
    // Description of this configuration
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // Assessment weightings (percentages)
    quizWeight: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.0,
      validate: { min: 0, max: 100 },
      comment: "Quiz weight as percentage (e.g., 5.00 for 5%)",
    },
    midtermWeight: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 30.0,
      validate: { min: 0, max: 100 },
      comment: "Midterm weight as percentage (e.g., 30.00 for 30%)",
    },
    assignmentWeight: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.0,
      validate: { min: 0, max: 100 },
      comment: "Assignment weight as percentage (e.g., 10.00 for 10%)",
    },
    projectWeight: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.0,
      validate: { min: 0, max: 100 },
      comment: "Project weight as percentage (e.g., 15.00 for 15%)",
    },
    finalWeight: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 40.0,
      validate: { min: 0, max: 100 },
      comment: "Final exam weight as percentage (e.g., 40.00 for 40%)",
    },
    // Maximum marks for each assessment (optional, for validation)
    quizMaxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.0,
      validate: { min: 0, max: 100 },
    },
    midtermMaxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 30.0,
      validate: { min: 0, max: 100 },
    },
    assignmentMaxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 10.0,
      validate: { min: 0, max: 100 },
    },
    projectMaxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 15.0,
      validate: { min: 0, max: 100 },
    },
    finalMaxMarks: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 40.0,
      validate: { min: 0, max: 100 },
    },
    // Whether this is the active/default configuration
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Metadata
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "assessment_configs",
    timestamps: true,
    hooks: {
      beforeSave: async (config) => {
        // Validate that weights add up to 100%
        const totalWeight =
          parseFloat(config.quizWeight) +
          parseFloat(config.midtermWeight) +
          parseFloat(config.assignmentWeight) +
          parseFloat(config.projectWeight) +
          parseFloat(config.finalWeight);

        if (Math.abs(totalWeight - 100) > 0.01) {
          throw new Error(
            `Assessment weights must add up to 100%. Current total: ${totalWeight}%`,
          );
        }
      },
      beforeCreate: async (config) => {
        // Only deactivate others if this is explicitly set as active
        // Don't automatically make new configs active
        if (config.isActive) {
          await AssessmentConfig.update(
            { isActive: false },
            { where: { isActive: true } },
          );
        }
      },
      beforeUpdate: async (config) => {
        // If this is set as active, deactivate all others
        if (config.isActive && config.changed("isActive")) {
          await AssessmentConfig.update(
            { isActive: false },
            {
              where: {
                isActive: true,
                id: { [require("sequelize").Op.ne]: config.id },
              },
            },
          );
        }
      },
    },
  },
);

// Static method to get active configuration
AssessmentConfig.getActive = async function () {
  let config = await AssessmentConfig.findOne({
    where: { isActive: true },
  });

  // If no active config, create default
  if (!config) {
    config = await AssessmentConfig.create({
      configName: "default",
      description: "Default assessment configuration",
      quizWeight: 5.0,
      midtermWeight: 30.0,
      assignmentWeight: 10.0,
      projectWeight: 15.0,
      finalWeight: 40.0,
      quizMaxMarks: 5.0,
      midtermMaxMarks: 30.0,
      assignmentMaxMarks: 10.0,
      projectMaxMarks: 15.0,
      finalMaxMarks: 40.0,
      isActive: true,
    });
  }

  return config;
};

// Static method to detect configuration from Excel data
AssessmentConfig.detectFromMarks = function (marks) {
  const { quiz, midterm, assignment, project, final } = marks;

  // Find the maximum values to determine weights
  const total = quiz + midterm + assignment + project + final;

  if (total === 0) {
    return null;
  }

  return {
    quizWeight: ((quiz / total) * 100).toFixed(2),
    midtermWeight: ((midterm / total) * 100).toFixed(2),
    assignmentWeight: ((assignment / total) * 100).toFixed(2),
    projectWeight: ((project / total) * 100).toFixed(2),
    finalWeight: ((final / total) * 100).toFixed(2),
    quizMaxMarks: quiz,
    midtermMaxMarks: midterm,
    assignmentMaxMarks: assignment,
    projectMaxMarks: project,
    finalMaxMarks: final,
  };
};

// Instance method to get formatted display
AssessmentConfig.prototype.getDisplayFormat = function () {
  return {
    quiz: `${this.quizWeight}% (${this.quizMaxMarks} marks)`,
    midterm: `${this.midtermWeight}% (${this.midtermMaxMarks} marks)`,
    assignment: `${this.assignmentWeight}% (${this.assignmentMaxMarks} marks)`,
    project: `${this.projectWeight}% (${this.projectMaxMarks} marks)`,
    final: `${this.finalWeight}% (${this.finalMaxMarks} marks)`,
  };
};

module.exports = AssessmentConfig;
