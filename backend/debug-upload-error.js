const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function debugUploadError() {
  try {
    console.log("🔍 Debugging Upload Error");
    console.log("=========================\n");

    // Login first
    console.log("1️⃣ Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        identifier: "admin@studentresults.edu",
        password: "admin123",
      },
    );

    const token = loginResponse.data.data.token;
    console.log("✅ Login successful\n");

    // Test with the percentage format file
    console.log("2️⃣ Testing upload with detailed error logging...");
    const filePath = path.join(
      __dirname,
      "uploads",
      "test_upload_with_percentages.xlsx",
    );

    if (fs.existsSync(filePath)) {
      const formData = new FormData();
      formData.append("excel", fs.createReadStream(filePath));

      const uploadResponse = await axios.post(
        "http://localhost:5001/api/admin/upload",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("📊 Full Upload Response:");
      console.log(JSON.stringify(uploadResponse.data, null, 2));

      // Check for any hidden errors
      if (uploadResponse.data.data.totalErrors > 0) {
        console.log("\n❌ Errors Found:");

        // Check general errors
        if (uploadResponse.data.data.errors) {
          console.log("General Errors:");
          uploadResponse.data.data.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(error, null, 2)}`);
          });
        }

        // Check sheet-specific errors
        if (uploadResponse.data.data.sheets) {
          uploadResponse.data.data.sheets.forEach((sheet, sheetIndex) => {
            if (sheet.errors && sheet.errors.length > 0) {
              console.log(`\nSheet "${sheet.sheet}" Errors:`);
              sheet.errors.forEach((error, errorIndex) => {
                console.log(
                  `   ${errorIndex + 1}. ${JSON.stringify(error, null, 2)}`,
                );
              });
            }
          });
        }
      }
    } else {
      console.log("❌ Test file not found. Creating a new one...");

      // Create a simple test file
      const XLSX = require("xlsx");
      const testData = [
        [
          "#",
          "STUDENT NAME",
          "STUDENT ID",
          "QUIZ(5%)",
          "MID(30%)",
          "ASSIGNMENT(15%)",
          "FINAL(50%)",
          "TOTAL",
          "GRADE",
        ],
        [1, "Debug Student", "DEBUG001", 4, 25, 12, 42, 83, "A-"],
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(testData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Debug_Test");
      XLSX.writeFile(workbook, filePath);

      console.log("✅ Created test file. Please run the script again.");
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    if (error.response) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
  }
}

debugUploadError();
