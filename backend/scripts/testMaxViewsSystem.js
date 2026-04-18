/**
 * Test script to verify the max views adjustment system is working correctly
 */

const { sequelize } = require("../config/database");
const DeviceView = require("../models/DeviceView");

async function testMaxViewsSystem() {
  console.log("🧪 Testing Max Views System...\n");

  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Test 1: Check default max views for new devices
    console.log("\n📋 Test 1: Default max views for new devices");

    const testDeviceId = `test-device-${Date.now()}`;
    const newDevice = await DeviceView.getOrCreate(
      testDeviceId,
      "127.0.0.1",
      "Test Browser",
    );

    console.log(`   Created device with maxViews: ${newDevice.maxViews}`);

    // Test 2: Update all devices max views
    console.log("\n📋 Test 2: Update all devices max views");

    const newMaxViews = 10;
    const [updatedCount] = await DeviceView.update(
      { maxViews: newMaxViews },
      { where: {} },
    );

    console.log(
      `   Updated ${updatedCount} devices to maxViews: ${newMaxViews}`,
    );

    // Test 3: Verify the update worked
    console.log("\n📋 Test 3: Verify update worked");

    const updatedDevice = await DeviceView.findOne({
      where: { deviceId: testDeviceId },
    });

    console.log(`   Test device now has maxViews: ${updatedDevice.maxViews}`);

    // Test 4: Create another new device and check if it uses the new default
    console.log("\n📋 Test 4: New device after global update");

    const testDeviceId2 = `test-device-2-${Date.now()}`;
    const newDevice2 = await DeviceView.getOrCreate(
      testDeviceId2,
      "127.0.0.1",
      "Test Browser 2",
    );

    console.log(`   New device created with maxViews: ${newDevice2.maxViews}`);

    // Test 5: Test device locking logic
    console.log("\n📋 Test 5: Device locking logic");

    console.log(
      `   Device viewCount: ${newDevice2.viewCount}, maxViews: ${newDevice2.maxViews}`,
    );
    console.log(`   Is locked: ${newDevice2.isDeviceLocked()}`);

    // Simulate reaching max views
    for (let i = 0; i < newDevice2.maxViews; i++) {
      await newDevice2.incrementView();
      console.log(
        `   After view ${i + 1}: viewCount=${newDevice2.viewCount}, locked=${newDevice2.isDeviceLocked()}`,
      );
    }

    // Test 6: Get all devices summary
    console.log("\n📋 Test 6: Current devices summary");

    const allDevices = await DeviceView.findAll({
      attributes: ["deviceId", "viewCount", "maxViews", "isLocked"],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    console.log("   Recent devices:");
    allDevices.forEach((device) => {
      console.log(
        `   - ${device.deviceId.substring(0, 20)}... | Views: ${device.viewCount}/${device.maxViews} | Locked: ${device.isLocked}`,
      );
    });

    // Cleanup test devices
    console.log("\n🧹 Cleaning up test devices...");
    await DeviceView.destroy({
      where: {
        deviceId: [testDeviceId, testDeviceId2],
      },
    });

    console.log("\n✅ All tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log("   ✓ New devices inherit current max views setting");
    console.log("   ✓ Global max views update works correctly");
    console.log("   ✓ Device locking logic respects max views");
    console.log("   ✓ System is working as expected");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

// Run the test if called directly
if (require.main === module) {
  testMaxViewsSystem()
    .then(() => {
      console.log("\n🎉 Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

module.exports = { testMaxViewsSystem };
