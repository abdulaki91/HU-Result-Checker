const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

class PDFService {
  constructor() {
    this.pageWidth = 595.28; // A4 width in points
    this.pageHeight = 841.89; // A4 height in points
    this.margin = 50;
    this.contentWidth = this.pageWidth - 2 * this.margin;
  }

  async generateTranscript(student) {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);

      // Embed fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = this.pageHeight - this.margin;

      // Get transcript data
      const transcript = await student.getTranscript();

      // Header
      yPosition = this.drawHeader(page, boldFont, regularFont, yPosition);

      // Student Information
      yPosition = this.drawStudentInfo(
        page,
        boldFont,
        regularFont,
        transcript.studentInfo,
        yPosition,
      );

      // Course Details
      yPosition = this.drawCourseDetails(
        page,
        boldFont,
        regularFont,
        transcript.courses,
        yPosition,
      );

      // Footer
      this.drawFooter(page, regularFont);

      return await pdfDoc.save();
    } catch (error) {
      console.error("PDF generation error:", error);
      throw new Error("Failed to generate PDF transcript");
    }
  }

  drawHeader(page, boldFont, regularFont, yPosition) {
    // Institution name
    page.drawText("STUDENT RESULT MANAGEMENT SYSTEM", {
      x: this.margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.8),
    });

    yPosition -= 25;

    // Document title
    page.drawText("OFFICIAL TRANSCRIPT", {
      x: this.margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 10;

    // Line separator
    page.drawLine({
      start: { x: this.margin, y: yPosition },
      end: { x: this.pageWidth - this.margin, y: yPosition },
      thickness: 2,
      color: rgb(0.8, 0.8, 0.8),
    });

    return yPosition - 30;
  }

  drawStudentInfo(page, boldFont, regularFont, studentInfo, yPosition) {
    // Section title
    page.drawText("STUDENT INFORMATION", {
      x: this.margin,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;

    const studentData = [
      { label: "Full Name:", value: studentInfo.fullName },
      { label: "Student ID:", value: studentInfo.studentId },
      { label: "Department:", value: studentInfo.department },
      { label: "Batch:", value: studentInfo.batch },
      { label: "Semester:", value: studentInfo.semester },
      { label: "Academic Year:", value: studentInfo.academicYear },
    ];

    // Draw in two columns
    const leftColumn = studentData.slice(0, 3);
    const rightColumn = studentData.slice(3);

    // Left column
    let tempY = yPosition;
    leftColumn.forEach((info) => {
      page.drawText(info.label, {
        x: this.margin,
        y: tempY,
        size: 10,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(info.value, {
        x: this.margin + 80,
        y: tempY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      tempY -= 18;
    });

    // Right column
    tempY = yPosition;
    rightColumn.forEach((info) => {
      page.drawText(info.label, {
        x: this.margin + 300,
        y: tempY,
        size: 10,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(info.value, {
        x: this.margin + 400,
        y: tempY,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      tempY -= 18;
    });

    return Math.min(tempY, yPosition - leftColumn.length * 18) - 20;
  }

  drawCourseDetails(page, boldFont, regularFont, courses, yPosition) {
    if (!courses || courses.length === 0) {
      return yPosition;
    }

    // Section title
    page.drawText("COURSE DETAILS", {
      x: this.margin,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;

    // Table headers
    const headers = [
      "Course Code",
      "Course Name",
      "Credit Hours",
      "Grade",
      "Grade Points",
    ];
    const columnWidths = [80, 200, 80, 60, 80];
    let xPosition = this.margin;

    // Draw header background
    page.drawRectangle({
      x: this.margin - 5,
      y: yPosition - 15,
      width: this.contentWidth + 10,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Draw headers
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPosition,
        y: yPosition,
        size: 9,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      xPosition += columnWidths[index];
    });

    yPosition -= 25;

    // Draw courses
    courses.forEach((course, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        page.drawRectangle({
          x: this.margin - 5,
          y: yPosition - 12,
          width: this.contentWidth + 10,
          height: 16,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      xPosition = this.margin;

      const courseData = [
        course.courseCode,
        course.courseName.length > 25
          ? course.courseName.substring(0, 25) + "..."
          : course.courseName,
        course.creditHours.toString(),
        course.grade,
        course.gradePoints.toFixed(1),
      ];

      courseData.forEach((data, colIndex) => {
        page.drawText(data, {
          x: xPosition,
          y: yPosition,
          size: 8,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        xPosition += columnWidths[colIndex];
      });

      yPosition -= 16;

      // Check if we need a new page
      if (yPosition < 100) {
        // Add new page logic here if needed
        return yPosition - 20;
      }
    });

    return yPosition - 20;
  }

  drawFooter(page, regularFont) {
    const footerY = 50;

    // Generation info
    const generatedText = `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    page.drawText(generatedText, {
      x: this.margin,
      y: footerY,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Disclaimer
    const disclaimer =
      "This is a computer-generated document. No signature is required.";
    page.drawText(disclaimer, {
      x: this.pageWidth - this.margin - 250,
      y: footerY,
      size: 8,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Line above footer
    page.drawLine({
      start: { x: this.margin, y: footerY + 15 },
      end: { x: this.pageWidth - this.margin, y: footerY + 15 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  }
}

module.exports = PDFService;
