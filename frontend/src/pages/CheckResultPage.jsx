import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  User,
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
} from "lucide-react";
import { studentAPI, handleApiError } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const CheckResultPage = () => {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [columnSettings, setColumnSettings] = useState([]);
  const [viewInfo, setViewInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await studentAPI.getById(studentId.trim());
      console.log("🔍 API Response:", response.data);
      console.log("📊 Column Settings received:", response.data.columnSettings);
      console.log("👁️ Visible Columns:", response.data.visibleColumns);

      setStudent(response.data.data);
      setColumnSettings(response.data.columnSettings || []);
      setViewInfo(response.data.viewInfo || null);
      toast.success("Student result found!");
    } catch (error) {
      const errorMessage = handleApiError(error);

      // Check if it's a locked result error
      if (error.response?.status === 403 && error.response?.data?.locked) {
        const lockData = error.response.data;
        toast.error(lockData.message);
        setStudent({
          locked: true,
          lockData: lockData,
        });
        setColumnSettings([]);
        setViewInfo(null);
      } else {
        toast.error(errorMessage);
        setStudent(null);
        setColumnSettings([]);
        setViewInfo(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatMark = (mark) => {
    if (mark === undefined || mark === null) return "-";
    const numMark = parseFloat(mark);
    if (isNaN(numMark)) return "-";
    // Remove unnecessary decimal places (e.g., 85.00 becomes 85, but 85.5 stays 85.5)
    return numMark % 1 === 0 ? numMark.toString() : numMark.toString();
  };

  // Helper function to check if a column should be visible
  const isColumnVisible = (columnKey) => {
    console.log(`🔍 Checking visibility for ${columnKey}:`, {
      columnSettings: columnSettings.length,
      hasSettings: columnSettings.length > 0,
    });

    if (!columnSettings || columnSettings.length === 0) {
      // If no settings loaded, show default columns
      const defaultVisible = [
        "fullName",
        "studentId",
        "department",
        "batch",
        "semester",
        "academicYear",
      ];
      const isVisible = defaultVisible.includes(columnKey);
      console.log(`📋 Using default for ${columnKey}: ${isVisible}`);
      return isVisible;
    }

    const setting = columnSettings.find((col) => col.columnKey === columnKey);
    const isVisible = setting ? setting.isVisible : false;
    console.log(
      `⚙️ Setting for ${columnKey}:`,
      setting,
      `visible: ${isVisible}`,
    );
    return isVisible;
  };

  // Helper function to check if course columns should be visible
  const isCourseColumnVisible = (columnKey) => {
    if (!columnSettings || columnSettings.length === 0) {
      // If no settings loaded, show default course columns
      const defaultVisible = [
        "quiz",
        "midterm",
        "assignment",
        "project",
        "final",
        "total",
        "grade",
      ];
      return defaultVisible.includes(columnKey);
    }

    const setting = columnSettings.find((col) => col.columnKey === columnKey);
    return setting ? setting.isVisible : false;
  };

  // Get column display name
  const getColumnDisplayName = (columnKey) => {
    if (!columnSettings || columnSettings.length === 0) {
      // Default display names
      const defaultNames = {
        fullName: "Full Name",
        studentId: "Student ID",
        department: "Department",
        batch: "Batch",
        semester: "Semester",
        academicYear: "Academic Year",
        quiz: "Quiz",
        midterm: "Midterm",
        assignment: "Assignment",
        project: "Project",
        final: "Final",
        total: "Total",
        grade: "Grade",
      };
      return defaultNames[columnKey] || columnKey;
    }

    const setting = columnSettings.find((col) => col.columnKey === columnKey);
    return setting ? setting.columnName : columnKey;
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      "A+": "text-green-600 bg-green-50",
      A: "text-green-600 bg-green-50",
      "A-": "text-green-500 bg-green-50",
      "B+": "text-blue-600 bg-blue-50",
      B: "text-blue-600 bg-blue-50",
      "B-": "text-blue-500 bg-blue-50",
      "C+": "text-yellow-600 bg-yellow-50",
      C: "text-yellow-600 bg-yellow-50",
      "C-": "text-yellow-500 bg-yellow-50",
      D: "text-orange-600 bg-orange-50",
      Fx: "text-red-500 bg-red-50",
      F: "text-red-600 bg-red-50",
    };
    return gradeColors[grade] || "text-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Check Your Result
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your student ID to view your academic results and
              performance
            </p>

            {/* Info Message */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Important:</span> You can
                    view your result up to 6 times only. After that, your access
                    will be locked. Please save or print your result when
                    viewing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="card-content">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="Enter your student ID (e.g., CS-2023-001)"
                  className="input w-full"
                  disabled={isLoading}
                />
              </div>
              <div className="sm:pt-7">
                <button
                  type="submit"
                  disabled={isLoading || !studentId.trim()}
                  className="btn-primary w-full sm:w-auto"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* View Count Warning */}
        {viewInfo && !student?.locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`card mb-6 ${
              viewInfo.remainingViews <= 3
                ? "border-orange-200 bg-orange-50"
                : viewInfo.remainingViews <= 1
                  ? "border-red-200 bg-red-50"
                  : ""
            }`}
          >
            <div className="card-content">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    viewInfo.remainingViews <= 1
                      ? "bg-red-100"
                      : viewInfo.remainingViews <= 3
                        ? "bg-orange-100"
                        : "bg-blue-100"
                  }`}
                >
                  <div
                    className={`h-4 w-4 ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-600"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  >
                    ⚠️
                  </div>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-800"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-800"
                          : "text-blue-800"
                    }`}
                  >
                    Result View Limit: {viewInfo.viewCount}/{viewInfo.maxViews}{" "}
                    views used
                  </p>
                  <p
                    className={`text-xs ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-600"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  >
                    {viewInfo.remainingViews > 0
                      ? `${viewInfo.remainingViews} views remaining. After ${viewInfo.maxViews} views, you'll need to contact admin to reset.`
                      : "Maximum views reached. Contact admin to reset your view count."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Locked Result Display */}
        {student?.locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card mb-8 border-red-200 bg-red-50"
          >
            <div className="card-content text-center">
              <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-2xl mb-4">
                <div className="h-8 w-8 text-red-600">🔒</div>
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">
                Result Access Locked
              </h2>
              <p className="text-red-700 mb-4">
                {student.lockData?.details ||
                  "You have exceeded the maximum number of result views."}
              </p>
              <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">
                      Views Used:
                    </span>
                    <span className="ml-2 text-red-600 font-bold">
                      {student.lockData?.viewCount || 0}/
                      {student.lockData?.maxViews || 10}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className="ml-2 text-red-600 font-bold">Locked</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  How to unlock:
                </h3>
                <p className="text-blue-700 text-sm">
                  Contact your system administrator to reset your result view
                  count. Provide your Student ID for assistance.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {student && !student.locked && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Student Info Card */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Student Information
                  </h2>
                  {columnSettings.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Showing{" "}
                      {
                        columnSettings.filter(
                          (col) =>
                            col.isVisible &&
                            [
                              "fullName",
                              "studentId",
                              "department",
                              "batch",
                              "semester",
                              "academicYear",
                              "email",
                              "phone",
                            ].includes(col.columnKey),
                        ).length
                      }{" "}
                      of{" "}
                      {
                        columnSettings.filter((col) =>
                          [
                            "fullName",
                            "studentId",
                            "department",
                            "batch",
                            "semester",
                            "academicYear",
                            "email",
                            "phone",
                          ].includes(col.columnKey),
                        ).length
                      }{" "}
                      fields
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {isColumnVisible("fullName") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("fullName")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.fullName}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("studentId") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("studentId")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.studentId}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("department") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("department")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.department}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("email") && student.studentInfo.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("email")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.email}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {isColumnVisible("batch") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("batch")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.batch}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("semester") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("semester")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.semester}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("academicYear") && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("academicYear")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.academicYear}
                        </p>
                      </div>
                    )}
                    {isColumnVisible("phone") && student.studentInfo.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          {getColumnDisplayName("phone")}
                        </label>
                        <p className="text-lg text-gray-900">
                          {student.studentInfo.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            {student.courses && student.courses.length > 0 && (
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Course Details
                    </h2>
                    {columnSettings.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Showing{" "}
                        {
                          columnSettings.filter(
                            (col) =>
                              col.isVisible &&
                              [
                                "quiz",
                                "midterm",
                                "assignment",
                                "project",
                                "final",
                                "total",
                                "grade",
                              ].includes(col.columnKey),
                          ).length
                        }{" "}
                        of{" "}
                        {
                          columnSettings.filter((col) =>
                            [
                              "quiz",
                              "midterm",
                              "assignment",
                              "project",
                              "final",
                              "total",
                              "grade",
                            ].includes(col.columnKey),
                          ).length
                        }{" "}
                        mark columns
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credits
                          </th>
                          {isCourseColumnVisible("quiz") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("quiz")}
                            </th>
                          )}
                          {isCourseColumnVisible("midterm") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("midterm")}
                            </th>
                          )}
                          {isCourseColumnVisible("assignment") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("assignment")}
                            </th>
                          )}
                          {isCourseColumnVisible("project") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("project")}
                            </th>
                          )}
                          {isCourseColumnVisible("final") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("final")}
                            </th>
                          )}
                          {isCourseColumnVisible("total") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("total")}
                            </th>
                          )}
                          {isCourseColumnVisible("grade") && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getColumnDisplayName("grade")}
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade Points
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {student.courses.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {course.courseCode}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.courseName}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {course.creditHours}
                            </td>
                            {isCourseColumnVisible("quiz") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.quiz)}
                              </td>
                            )}
                            {isCourseColumnVisible("midterm") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.midterm)}
                              </td>
                            )}
                            {isCourseColumnVisible("assignment") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.assignment)}
                              </td>
                            )}
                            {isCourseColumnVisible("project") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.project)}
                              </td>
                            )}
                            {isCourseColumnVisible("final") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.final)}
                              </td>
                            )}
                            {isCourseColumnVisible("total") && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMark(course.marks?.total)}
                              </td>
                            )}
                            {isCourseColumnVisible("grade") && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(course.grade)}`}
                                >
                                  {course.grade}
                                </span>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseFloat(course.gradePoints) || 0).toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Info */}
            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Generated on: {new Date(student.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheckResultPage;
