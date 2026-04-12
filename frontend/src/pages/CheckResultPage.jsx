import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  Award,
  Lock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { studentAPI, handleApiError } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const CheckResultPage = () => {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [columnSettings, setColumnSettings] = useState([]);
  const [assessmentConfig, setAssessmentConfig] = useState(null);
  const [viewInfo, setViewInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [isDeviceLocked, setIsDeviceLocked] = useState(false);
  const [lockData, setLockData] = useState(null);

  // Check if device is locked on component mount
  useEffect(() => {
    const checkDeviceLock = async () => {
      try {
        // Check with backend for current device status
        const response = await studentAPI.checkDeviceStatus();
        const { isLocked, viewCount, maxViews } = response.data;

        if (isLocked) {
          // Device is locked on backend
          setIsDeviceLocked(true);
          const lockInfo = {
            viewCount,
            maxViews,
            lockedAt: new Date().toISOString(),
          };
          localStorage.setItem("deviceLocked", "true");
          localStorage.setItem("deviceLockData", JSON.stringify(lockInfo));
          setLockData(lockInfo);
        } else {
          // Device is not locked, clear any stale localStorage data
          localStorage.removeItem("deviceLocked");
          localStorage.removeItem("deviceLockData");
          setIsDeviceLocked(false);
          setLockData(null);
        }
      } catch (error) {
        console.error("Error checking device status:", error);
        // On error, clear localStorage to be safe
        localStorage.removeItem("deviceLocked");
        localStorage.removeItem("deviceLockData");
        setIsDeviceLocked(false);
        setLockData(null);
      }
    };

    checkDeviceLock();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    // Check if device is locked before making request
    if (isDeviceLocked) {
      toast.error("This device is locked. Contact administrator to reset.");
      return;
    }

    setIsLoading(true);
    setShowLoadingOverlay(true);
    try {
      const response = await studentAPI.getById(studentId.trim());
      console.log("🔍 API Response:", response.data);
      console.log("📊 Column Settings received:", response.data.columnSettings);
      console.log("👁️ Visible Columns:", response.data.visibleColumns);
      console.log(
        "⚖️ Assessment Config received:",
        response.data.assessmentConfig,
      );

      setStudent(response.data.data);
      setColumnSettings(response.data.columnSettings || []);
      setAssessmentConfig(response.data.assessmentConfig || null);
      setViewInfo(response.data.viewInfo || null);

      // Check if device got locked after this view
      if (response.data.viewInfo?.isLocked) {
        setIsDeviceLocked(true);
        const lockInfo = {
          viewCount: response.data.viewInfo.viewCount,
          maxViews: response.data.viewInfo.maxViews,
          lockedAt: new Date().toISOString(),
        };
        localStorage.setItem("deviceLocked", "true");
        localStorage.setItem("deviceLockData", JSON.stringify(lockInfo));
        setLockData(lockInfo);
        toast.error("This was your last view. Device is now locked.");
      } else {
        toast.success("Student result found!");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);

      // Check if it's a locked result error
      if (error.response?.status === 403 && error.response?.data?.locked) {
        const lockDataFromServer = error.response.data;
        toast.error(lockDataFromServer.message);

        // Store lock status in localStorage
        setIsDeviceLocked(true);
        const lockInfo = {
          viewCount: lockDataFromServer.viewCount,
          maxViews: lockDataFromServer.maxViews,
          lockedAt: new Date().toISOString(),
          details: lockDataFromServer.details,
        };
        localStorage.setItem("deviceLocked", "true");
        localStorage.setItem("deviceLockData", JSON.stringify(lockInfo));
        setLockData(lockInfo);

        setStudent({
          locked: true,
          lockData: lockDataFromServer,
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
      setShowLoadingOverlay(false);
    }
  };

  const formatMark = (mark) => {
    if (mark === undefined || mark === null) return "-";
    const numMark = parseFloat(mark);
    if (isNaN(numMark)) return "-";
    // Remove unnecessary decimal places (e.g., 85.00 becomes 85, but 85.5 stays 85.5)
    return numMark % 1 === 0 ? numMark.toString() : numMark.toString();
  };

  // Calculate grade from total marks using the standard grading scale
  const calculateGrade = (totalMarks) => {
    if (totalMarks === undefined || totalMarks === null) return "F";
    const numMarks = parseFloat(totalMarks);
    if (isNaN(numMarks)) return "F";

    if (numMarks >= 90) return "A+";
    if (numMarks >= 85) return "A";
    if (numMarks >= 80) return "A-";
    if (numMarks >= 75) return "B+";
    if (numMarks >= 70) return "B";
    if (numMarks >= 65) return "B-";
    if (numMarks >= 60) return "C+";
    if (numMarks >= 50) return "C";
    if (numMarks >= 45) return "C-";
    if (numMarks >= 40) return "D";
    if (numMarks >= 30) return "Fx";
    return "F";
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

  // Get column display name without weighting
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
    const displayName = setting ? setting.columnName : columnKey;

    return displayName;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/20 to-purple-900/20 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-2 border-white/50"
            >
              <LoadingSpinner
                variant="gradient"
                text="Fetching your results..."
                size="lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl mb-6 shadow-xl"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Check Your Result
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Enter your student ID to view your academic results and
              performance
            </p>

            {/* Info Message */}
            <motion.div
              className="mt-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start space-x-4 shadow-lg">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Important Notice
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This device can view student results up to{" "}
                    <span className="font-bold">6 times total</span>. After
                    that, access will be locked for this device. Please save or
                    print results when viewing.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-10"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label
                htmlFor="studentId"
                className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-indigo-500" />
                Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="Enter your student ID (e.g., CS-2023-001)"
                  className="w-full h-14 px-6 pr-12 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                  disabled={isLoading}
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="sm:pt-7">
              <motion.button
                type="submit"
                disabled={isLoading || !studentId.trim() || isDeviceLocked}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
                whileHover={{ scale: isDeviceLocked ? 1 : 1.02 }}
                whileTap={{ scale: isDeviceLocked ? 1 : 0.98 }}
              >
                {isDeviceLocked ? (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Device Locked
                  </>
                ) : isLoading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mr-2"
                    >
                      <Sparkles className="h-5 w-5" />
                    </motion.div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* View Count Warning */}
        <AnimatePresence>
          {viewInfo && !student?.locked && !isDeviceLocked && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl p-5 mb-8 shadow-lg border-2 ${
                viewInfo.remainingViews <= 1
                  ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-300"
                  : viewInfo.remainingViews <= 3
                    ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300"
              }`}
            >
              <div className="flex items-center">
                <motion.div
                  className={`p-3 rounded-2xl mr-4 ${
                    viewInfo.remainingViews <= 1
                      ? "bg-red-100"
                      : viewInfo.remainingViews <= 3
                        ? "bg-orange-100"
                        : "bg-blue-100"
                  }`}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertCircle
                    className={`h-6 w-6 ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-600"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  />
                </motion.div>
                <div className="flex-1">
                  <p
                    className={`text-base font-bold mb-1 ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-900"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-900"
                          : "text-blue-900"
                    }`}
                  >
                    Device View Limit: {viewInfo.viewCount}/{viewInfo.maxViews}{" "}
                    views used
                  </p>
                  <p
                    className={`text-sm ${
                      viewInfo.remainingViews <= 1
                        ? "text-red-700"
                        : viewInfo.remainingViews <= 3
                          ? "text-orange-700"
                          : "text-blue-700"
                    }`}
                  >
                    {viewInfo.isLocked
                      ? viewInfo.message ||
                        "This device is now locked. Contact admin to reset."
                      : viewInfo.remainingViews > 0
                        ? `${viewInfo.remainingViews} view(s) remaining. After ${viewInfo.maxViews} views, this device will be locked.`
                        : "Maximum views reached. This device is now locked."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked Result Display */}
        <AnimatePresence>
          {(student?.locked || isDeviceLocked) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl shadow-2xl border-2 border-red-300 p-10 mb-10"
            >
              <div className="text-center">
                <motion.div
                  className="inline-flex items-center justify-center p-5 bg-red-100 rounded-3xl mb-6"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Lock className="h-12 w-12 text-red-600" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold text-red-900 mb-4">
                  Device Locked
                </h2>
                <p className="text-lg text-red-700 mb-6 max-w-md mx-auto">
                  {student?.lockData?.details ||
                    lockData?.details ||
                    "This device has exceeded the maximum number of result views."}
                </p>
                <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-red-200 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-6 text-base">
                    <div>
                      <span className="font-semibold text-gray-600 block mb-1">
                        Views Used:
                      </span>
                      <span className="text-2xl text-red-600 font-bold">
                        {student?.lockData?.viewCount ||
                          lockData?.viewCount ||
                          0}
                        /
                        {student?.lockData?.maxViews || lockData?.maxViews || 6}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600 block mb-1">
                        Status:
                      </span>
                      <span className="text-2xl text-red-600 font-bold">
                        Locked
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-md mx-auto">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">
                    How to unlock:
                  </h3>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Contact your system administrator to reset your device view
                    count. This lock persists even after page refresh for
                    security.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {student && !student.locked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Student Info Card */}
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mr-3">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    Student Information
                  </h2>
                  {columnSettings.length > 0 && (
                    <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    {isColumnVisible("fullName") && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("fullName")}
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {student.studentInfo.fullName}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("studentId") && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("studentId")}
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {student.studentInfo.studentId}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("department") && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("department")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.department}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("email") && student.studentInfo.email && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("email")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.email}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-5">
                    {isColumnVisible("batch") && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-cyan-50 to-sky-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("batch")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.batch}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("semester") && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("semester")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.semester}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("academicYear") && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("academicYear")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.academicYear}
                        </p>
                      </motion.div>
                    )}
                    {isColumnVisible("phone") && student.studentInfo.phone && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-2xl"
                      >
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                          {getColumnDisplayName("phone")}
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {student.studentInfo.phone}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Course Details */}
              {student.courses && student.courses.length > 0 && (
                <motion.div
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mr-3">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      Course Details
                    </h2>
                    {columnSettings.length > 0 && (
                      <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">
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

                  <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Credits
                          </th>
                          {isCourseColumnVisible("quiz") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("quiz")}
                            </th>
                          )}
                          {isCourseColumnVisible("midterm") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("midterm")}
                            </th>
                          )}
                          {isCourseColumnVisible("assignment") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("assignment")}
                            </th>
                          )}
                          {isCourseColumnVisible("project") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("project")}
                            </th>
                          )}
                          {isCourseColumnVisible("final") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("final")}
                            </th>
                          )}
                          {isCourseColumnVisible("total") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("total")}
                            </th>
                          )}
                          {isCourseColumnVisible("grade") && (
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              {getColumnDisplayName("grade")}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {student.courses.map((course, index) => {
                          // Calculate grade from total marks on the frontend
                          const calculatedGrade = calculateGrade(
                            course.marks?.total,
                          );

                          return (
                            <motion.tr
                              key={index}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {course.courseCode}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {course.courseName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {course.creditHours}
                              </td>
                              {isCourseColumnVisible("quiz") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatMark(course.marks?.quiz)}
                                </td>
                              )}
                              {isCourseColumnVisible("midterm") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatMark(course.marks?.midterm)}
                                </td>
                              )}
                              {isCourseColumnVisible("assignment") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatMark(course.marks?.assignment)}
                                </td>
                              )}
                              {isCourseColumnVisible("project") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatMark(course.marks?.project)}
                                </td>
                              )}
                              {isCourseColumnVisible("final") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatMark(course.marks?.final)}
                                </td>
                              )}
                              {isCourseColumnVisible("total") && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                  {formatMark(course.marks?.total)}
                                </td>
                              )}
                              {isCourseColumnVisible("grade") && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-xl shadow-sm ${getGradeColor(calculatedGrade)}`}
                                  >
                                    {calculatedGrade}
                                  </span>
                                </td>
                              )}
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Generated Info */}
              <motion.div
                className="text-center text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center space-x-2 bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-3 inline-flex">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    Generated on:{" "}
                    {new Date(student.generatedAt).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckResultPage;
