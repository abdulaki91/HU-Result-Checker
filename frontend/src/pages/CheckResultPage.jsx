import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  User,
  BookOpen,
  Award,
  Calendar,
  GraduationCap,
  FileText,
} from "lucide-react";
import { studentAPI, handleApiError, downloadFile } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const CheckResultPage = () => {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    setIsLoading(true);
    try {
      const response = await studentAPI.getById(studentId.trim());
      setStudent(response.data.data);
      toast.success("Student result found!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!student) return;

    setIsDownloading(true);
    try {
      const response = await studentAPI.downloadPDF(
        student.studentInfo.studentId,
      );
      downloadFile(
        response.data,
        `transcript_${student.studentInfo.studentId}.pdf`,
      );
      toast.success("Transcript downloaded successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
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
      "D+": "text-orange-600 bg-orange-50",
      D: "text-orange-600 bg-orange-50",
      F: "text-red-600 bg-red-50",
    };
    return gradeColors[grade] || "text-gray-600 bg-gray-50";
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 3.0) return "text-blue-600";
    if (gpa >= 2.5) return "text-yellow-600";
    if (gpa >= 2.0) return "text-orange-600";
    return "text-red-600";
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

        {/* Results */}
        {student && (
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
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="btn-secondary"
                  >
                    {isDownloading ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {student.studentInfo.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Student ID
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {student.studentInfo.studentId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Department
                      </label>
                      <p className="text-lg text-gray-900">
                        {student.studentInfo.department}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Batch
                      </label>
                      <p className="text-lg text-gray-900">
                        {student.studentInfo.batch}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Semester
                      </label>
                      <p className="text-lg text-gray-900">
                        {student.studentInfo.semester}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Academic Year
                      </label>
                      <p className="text-lg text-gray-900">
                        {student.studentInfo.academicYear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="card">
              <div className="card-content">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Academic Performance
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold mb-1 ${getGPAColor(parseFloat(student.academicPerformance.gpa) || 0)}`}
                    >
                      {(
                        parseFloat(student.academicPerformance.gpa) || 0
                      ).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Current GPA</div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold mb-1 ${getGPAColor(parseFloat(student.academicPerformance.cgpa) || 0)}`}
                    >
                      {(
                        parseFloat(student.academicPerformance.cgpa) || 0
                      ).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">CGPA</div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {student.academicPerformance.completedCreditHours}
                    </div>
                    <div className="text-sm text-gray-500">
                      Completed Credits
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {student.academicPerformance.totalCreditHours}
                    </div>
                    <div className="text-sm text-gray-500">Total Credits</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Grade Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.academicPerformance.gradeStatus === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : student.academicPerformance.gradeStatus === "Good"
                            ? "bg-blue-100 text-blue-800"
                            : student.academicPerformance.gradeStatus ===
                                "Satisfactory"
                              ? "bg-yellow-100 text-yellow-800"
                              : student.academicPerformance.gradeStatus ===
                                  "Pass"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.academicPerformance.gradeStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            {student.courses && student.courses.length > 0 && (
              <div className="card">
                <div className="card-content">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Course Details
                  </h2>

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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grade
                          </th>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(course.grade)}`}
                              >
                                {course.grade}
                              </span>
                            </td>
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
