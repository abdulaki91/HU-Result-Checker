// Test device view functionality
const { sequelize, DeviceView } = require("../models");

async function testDeviceView() {
  try {
    console.log("🔄 Testing device view functionality...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Test creating a device
    const testDeviceId = "test_device_123";
    const device = await DeviceView.getOrCreate(
      testDeviceId,
      "127.0.0.1",
      "Test User Agent",
    );
    console.log("✅ Device created:", {
      deviceId: device.deviceId,
      viewCount: device.viewCount,
      maxViews: device.maxViews,
      isLocked: device.isLocked,
    });

    // Test incrementing views
    for (let i = 1; i <= 7; i++) {
      const isLocked = device.isDeviceLocked();
      console.log(`\n📊 View ${i}:`);
      console.log(
        `   Before: viewCount=${device.viewCount}, isLocked=${isLocked}`,
      );

      if (!isLocked) {
        await device.incrementView();
        console.log(
          `   After: viewCount=${device.viewCount}, isLocked=${device.isLocked}`,
        );
      } else {
        console.log(`   ❌ Device is locked! Cannot increment.`);
      }
    }

    // Clean up test data
    await device.destroy();
    console.log("\n✅ Test completed and cleaned up");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testDeviceView();
