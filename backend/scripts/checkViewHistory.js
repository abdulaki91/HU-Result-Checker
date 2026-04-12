const { DeviceView, DeviceViewHistory } = require("../models");

async function checkViewHistory() {
  try {
    console.log("\n🔍 Checking View History Data...\n");

    // Check device_views table
    const devices = await DeviceView.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    console.log(`📱 Total devices in device_views: ${devices.length}`);
    if (devices.length > 0) {
      console.log("\nSample devices:");
      devices.forEach((d, i) => {
        console.log(
          `  ${i + 1}. Device ID: ${d.deviceId.substring(0, 20)}... | Views: ${d.viewCount}/${d.maxViews} | Locked: ${d.isLocked}`,
        );
      });
    }

    // Check device_view_history table
    const history = await DeviceViewHistory.findAll({
      limit: 10,
      order: [["viewedAt", "DESC"]],
    });

    console.log(`\n📊 Total records in device_view_history: ${history.length}`);
    if (history.length > 0) {
      console.log("\nSample view history:");
      history.forEach((h, i) => {
        console.log(
          `  ${i + 1}. Device: ${h.deviceId.substring(0, 15)}... | Student: ${h.studentId} | Viewed: ${h.viewedAt} | IP: ${h.ipAddress}`,
        );
      });

      // Get unique student IDs
      const uniqueStudents = [...new Set(history.map((h) => h.studentId))];
      console.log(`\n👥 Unique students viewed: ${uniqueStudents.length}`);
      console.log("Student IDs:", uniqueStudents);

      // Test search for first student
      if (uniqueStudents.length > 0) {
        const testStudentId = uniqueStudents[0];
        console.log(`\n🔎 Testing search for student: ${testStudentId}`);

        const devicesForStudent =
          await DeviceViewHistory.getDevicesByStudent(testStudentId);
        console.log(
          `   Found ${devicesForStudent.length} view records for this student`,
        );

        const uniqueDevices = [
          ...new Set(devicesForStudent.map((v) => v.deviceId)),
        ];
        console.log(`   Unique devices: ${uniqueDevices.length}`);
        uniqueDevices.forEach((did, i) => {
          console.log(`     ${i + 1}. ${did.substring(0, 30)}...`);
        });
      }
    } else {
      console.log("\n⚠️  No view history found!");
      console.log(
        "This means no student results have been viewed yet, or history logging is not working.",
      );
    }

    console.log("\n✅ Check complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkViewHistory();
