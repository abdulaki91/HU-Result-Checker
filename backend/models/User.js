const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_]+$/,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "teacher", "staff"),
      defaultValue: "staff",
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  try {
    if (this.isLocked()) {
      console.log(`Account locked for user: ${this.username}`);
      throw new Error("Account is temporarily locked");
    }

    console.log(`Comparing password for user: ${this.username}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);

    if (!isMatch) {
      console.log(
        `Password mismatch for user: ${this.username}, incrementing login attempts`,
      );
      this.loginAttempts += 1;

      // Lock account after 5 failed attempts for 30 minutes
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.log(
          `Account locked for user: ${this.username} after 5 failed attempts`,
        );
      }

      await this.save();
      return false;
    }

    // Reset login attempts on successful login
    if (this.loginAttempts > 0) {
      console.log(`Resetting login attempts for user: ${this.username}`);
      this.loginAttempts = 0;
      this.lockUntil = null;
    }

    this.lastLogin = new Date();
    await this.save();

    return true;
  } catch (error) {
    console.error(
      `comparePassword error for user ${this.username}:`,
      error.message,
    );
    throw error;
  }
};

User.prototype.getTokenPayload = function () {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    role: this.role,
    fullName: this.fullName,
  };
};

// Virtual for account lock status
User.prototype.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Static method to find by credentials
User.findByCredentials = async function (identifier, password) {
  try {
    console.log(`Searching for user with identifier: ${identifier}`);

    // Find user by email or username
    const user = await this.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { email: identifier.toLowerCase() },
          { username: identifier },
        ],
        isActive: true,
      },
    });

    if (!user) {
      console.log(`No user found with identifier: ${identifier}`);
      throw new Error("Invalid credentials");
    }

    console.log(
      `User found: ${user.username} (${user.email}), checking password...`,
    );

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${user.username}`);
      throw new Error("Invalid credentials");
    }

    console.log(`Password verified for user: ${user.username}`);
    return user;
  } catch (error) {
    console.error("findByCredentials error:", error.message);
    throw error;
  }
};

// Remove password from JSON output
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.loginAttempts;
  delete values.lockUntil;
  return values;
};

module.exports = User;
