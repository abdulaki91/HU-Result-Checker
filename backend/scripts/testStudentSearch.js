const { DeviceView, DeviceViewHistory } = require("../models");
const { Op } = require("sequelize");

async function testSearch() {
  const testStudentId = process.argv[2] || "UGPR1005/15";

  console.log(`\n🔎 Testing search for: "${testStudentId}"\n`);

  try {
    // Test 1: Direct search
    console.log("Test 1: Direct search in history table");
    const history1 = await DeviceViewHistory.findAll({
      where: { studentId: testStudentId },
    });
    console.log(`  Result: ${history1.length} records found`);

    // Test 2: Using the model method
    console.log("\nTest 2: Using getDevicesByStudent method");
    const history2 = await DeviceViewHistory.getDevicesByStudent(testStudentId);
    console.log(`  Result: ${history2.length} records found`);

    if (history2.length > 0) {
      const deviceIds = [...new Set(history2.map((v) => v.deviceId))];
      console.log(`  Unique devices: ${deviceIds.length}`);

      // Test 3: Find devices
      console.log("\nTest 3: Finding devices in device_views table");
      const devices = await DeviceView.findAll({
        where: {
          deviceId: { [Op.in]: deviceIds },
        },
      });
      console.log(`  Result: ${devices.length} devices found`);

      if (devices.length > 0) {
        devices.forEach((d, i) => {
          console.log(
            `    ${i + 1}. ${d.deviceId.substring(0, 20)}... | Views: ${d.viewCount}/${d.maxViews} | Locked: ${d.isLocked}`,
          );
        });
      }
    }

    // Test 4: List all student IDs in database
    console.log("\nTest 4: All student IDs in database:");
    const allHistory = await DeviceViewHistory.findAll({
      attributes: ["studentId"],
      group: ["studentId"],
    });
    console.log(`  Total unique students: ${allHistory.length}`);
    allHistory.forEach((h, i) => {
      console.log(`    ${i + 1}. "${h.studentId}"`);
    });

    console.log("\n✅ Test complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testSearch();
