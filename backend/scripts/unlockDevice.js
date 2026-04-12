#!/usr/bin/env node

/**
 * Manual Device Unlock Script
 *
 * Usage:
 *   node unlockDevice.js <deviceId>
 *   node unlockDevice.js --all
 *   node unlockDevice.js --list
 */

const { DeviceView } = require("../models");
const { Op } = require("sequelize");

async function listLockedDevices() {
  console.log("\n🔍 Searching for locked devices...\n");

  const devices = await DeviceView.findAll({
    where: {
      [Op.or]: [
        { isLocked: true },
        { viewCount: { [Op.gte]: DeviceView.sequelize.col("maxViews") } },
      ],
    },
    order: [["lastViewedAt", "DESC"]],
  });

  if (devices.length === 0) {
    console.log("✅ No locked devices found!\n");
    return;
  }

  console.log(`Found ${devices.length} locked device(s):\n`);
  console.log("─".repeat(100));
  console.log(
    "Device ID".padEnd(40) +
      "Views".padEnd(10) +
      "Locked".padEnd(10) +
      "Last Viewed".padEnd(25) +
      "IP Address",
  );
  console.log("─".repeat(100));

  devices.forEach((device) => {
    const deviceId = device.deviceId.substring(0, 37) + "...";
    const views = `${device.viewCount}/${device.maxViews}`;
    const locked = device.isLocked ? "Yes" : "No";
    const lastViewed = device.lastViewedAt
      ? new Date(device.lastViewedAt).toLocaleString()
      : "Never";
    const ip = device.ipAddress || "N/A";

    console.log(
      deviceId.padEnd(40) +
        views.padEnd(10) +
        locked.padEnd(10) +
        lastViewed.padEnd(25) +
        ip,
    );
  });

  console.log("─".repeat(100));
  console.log();
}

async function unlockDevice(deviceId) {
  console.log(`\n🔓 Unlocking device: ${deviceId}...\n`);

  const device = await DeviceView.findOne({
    where: { deviceId },
  });

  if (!device) {
    console.error("❌ Device not found!");
    console.log(`   Device ID: ${deviceId}\n`);
    return false;
  }

  console.log("Device found:");
  console.log(`   Device ID: ${device.deviceId}`);
  console.log(`   View Count: ${device.viewCount}/${device.maxViews}`);
  console.log(`   Is Locked: ${device.isLocked}`);
  console.log(
    `   Last Viewed: ${device.lastViewedAt ? new Date(device.lastViewedAt).toLocaleString() : "Never"}`,
  );
  console.log(`   IP Address: ${device.ipAddress || "N/A"}\n`);

  // Reset the device
  device.viewCount = 0;
  device.isLocked = false;
  await device.save();

  console.log("✅ Device unlocked successfully!");
  console.log(`   New View Count: ${device.viewCount}/${device.maxViews}`);
  console.log(`   Is Locked: ${device.isLocked}\n`);

  return true;
}

async function unlockAllDevices() {
  console.log("\n🔓 Unlocking all locked devices...\n");

  const result = await DeviceView.update(
    {
      viewCount: 0,
      isLocked: false,
    },
    {
      where: {
        [Op.or]: [
          { isLocked: true },
          { viewCount: { [Op.gte]: DeviceView.sequelize.col("maxViews") } },
        ],
      },
    },
  );

  console.log(`✅ Successfully unlocked ${result[0]} device(s)\n`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("\n📖 Usage:");
    console.log(
      "   node unlockDevice.js <deviceId>  - Unlock a specific device",
    );
    console.log(
      "   node unlockDevice.js --all       - Unlock all locked devices",
    );
    console.log(
      "   node unlockDevice.js --list      - List all locked devices\n",
    );
    process.exit(0);
  }

  try {
    const command = args[0];

    if (command === "--list") {
      await listLockedDevices();
    } else if (command === "--all") {
      await unlockAllDevices();
    } else {
      // Assume it's a device ID
      const success = await unlockDevice(command);
      if (!success) {
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the script
main();
