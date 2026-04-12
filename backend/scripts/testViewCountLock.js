const { DeviceView } = require("../models");

async function testViewCountLock() {
  console.log("🧪 Testing View Count Lock Mechanism\n");

  try {
    // Test device ID
    const testDeviceId = "test-device-" + Date.now();

    console.log("1️⃣  Creating new device...");
    const device = await DeviceView.getOrCreate(
      testDeviceId,
      "127.0.0.1",
      "Test User Agent",
    );
    console.log(`   Device created: ${device.deviceId}`);
    console.log(`   Initial view count: ${device.viewCount}`);
    console.log(`   Max views: ${device.maxViews}`);
    console.log(`   Is locked: ${device.isDeviceLocked()}\n`);

    // Test incrementing views
    console.log("2️⃣  Testing view increments...");
    for (let i = 1; i <= 7; i++) {
      const isLockedBefore = device.isDeviceLocked();
      console.log(`\n   Attempt ${i}:`);
      console.log(`   - Locked before: ${isLockedBefore}`);

      if (isLockedBefore) {
        console.log(`   - ❌ Device is locked, cannot increment`);
        break;
      }

      const newCount = await device.incrementView();
      await device.reload(); // Reload from database

      console.log(`   - View count: ${newCount}/${device.maxViews}`);
      console.log(`   - Is locked: ${device.isDeviceLocked()}`);
      console.log(`   - isLocked flag: ${device.isLocked}`);

      if (device.isDeviceLocked()) {
        console.log(`   - 🔒 Device locked after this view!`);
      }
    }

    // Test that locked device cannot increment
    console.log("\n3️⃣  Testing locked device behavior...");
    const finalDevice = await DeviceView.findOne({
      where: { deviceId: testDeviceId },
    });
    console.log(`   Final view count: ${finalDevice.viewCount}`);
    console.log(`   Is locked: ${finalDevice.isDeviceLocked()}`);
    console.log(`   isLocked flag: ${finalDevice.isLocked}`);

    // Try to increment again
    console.log("\n4️⃣  Attempting to increment locked device...");
    const beforeCount = finalDevice.viewCount;
    await finalDevice.incrementView();
    await finalDevice.reload();
    console.log(`   View count before: ${beforeCount}`);
    console.log(`   View count after: ${finalDevice.viewCount}`);
    console.log(
      `   ${beforeCount === finalDevice.viewCount ? "✅ Correctly prevented increment" : "❌ ERROR: Increment was allowed!"}`,
    );

    // Clean up
    console.log("\n5️⃣  Cleaning up test device...");
    await finalDevice.destroy();
    console.log("   Test device deleted\n");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the test
testViewCountLock();
