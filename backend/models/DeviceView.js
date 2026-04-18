const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const DeviceView = sequelize.define(
  "DeviceView",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: "Unique identifier for the device/browser",
    },
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
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: "IP address for additional tracking",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Browser user agent string",
    },
  },
  {
    tableName: "device_views",
    indexes: [
      {
        unique: true,
        fields: ["deviceId"],
      },
    ],
  },
);

// Instance method to check if device is locked
DeviceView.prototype.isDeviceLocked = function () {
  // Device is locked if explicitly locked OR if view count has reached/exceeded max
  return this.isLocked === true || this.viewCount >= this.maxViews;
};

// Instance method to increment view count
DeviceView.prototype.incrementView = async function () {
  // Don't increment if already locked
  if (this.isDeviceLocked()) {
    return this.viewCount;
  }

  this.viewCount += 1;
  this.lastViewedAt = new Date();

  // Lock if max views reached or exceeded
  if (this.viewCount >= this.maxViews) {
    this.isLocked = true;
  }

  await this.save();
  return this.viewCount;
};

// Static method to get current default max views (from most recent device or fallback to 6)
DeviceView.getDefaultMaxViews = async function () {
  try {
    // Get the most recently updated device to use its maxViews as the current default
    const recentDevice = await this.findOne({
      order: [["updatedAt", "DESC"]],
      attributes: ["maxViews"],
    });

    return recentDevice ? recentDevice.maxViews : 6; // Fallback to 6 if no devices exist
  } catch (error) {
    console.error("Error getting default max views:", error);
    return 6; // Fallback to 6 on error
  }
};

// Static method to get or create device record
DeviceView.getOrCreate = async function (deviceId, ipAddress, userAgent) {
  // Get current default max views
  const defaultMaxViews = await this.getDefaultMaxViews();

  const [device, created] = await this.findOrCreate({
    where: { deviceId },
    defaults: {
      deviceId,
      ipAddress,
      userAgent,
      viewCount: 0,
      maxViews: defaultMaxViews,
      isLocked: false,
    },
  });

  // If device exists, update IP and user agent
  if (!created) {
    device.ipAddress = ipAddress;
    device.userAgent = userAgent;
    await device.save();
  }

  return device;
};

module.exports = DeviceView;
