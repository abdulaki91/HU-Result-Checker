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
  return this.isLocked || this.viewCount >= this.maxViews;
};

// Instance method to increment view count
DeviceView.prototype.incrementView = async function () {
  this.viewCount += 1;
  this.lastViewedAt = new Date();

  // Lock if max views reached
  if (this.viewCount >= this.maxViews) {
    this.isLocked = true;
  }

  await this.save();
  return this.viewCount;
};

// Static method to get or create device record
DeviceView.getOrCreate = async function (deviceId, ipAddress, userAgent) {
  const [device, created] = await this.findOrCreate({
    where: { deviceId },
    defaults: {
      deviceId,
      ipAddress,
      userAgent,
      viewCount: 0,
      maxViews: 6,
      isLocked: false,
    },
  });

  return device;
};

module.exports = DeviceView;
