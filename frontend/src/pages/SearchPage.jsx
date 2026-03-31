import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, GraduationCap, BookOpen } from "lucide-react";
import { studentAPI, handleApiError } from "../services/api";
import LoadingSpinner, {
  SkeletonLoader,
} from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ departments: [], batches: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Load filters on component mount
  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const response = await studentAPI.getFilters();
      setFilters(response.data.data);
    } catch (error) {
      console.error("Failed to load filters:", error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      const searchFilters = {};
      if (selectedDepartment) searchFilters.department = selectedDepartment;
      if (selectedBatch) searchFilters.batch = selectedBatch;

      const response = await studentAPI.search(
        searchQuery.trim(),
        searchFilters,
      );
      setStudents(response.data.data);

      if (response.data.data.length === 0) {
        toast.info("No students found matching your search criteria");
      } else {
        toast.success(`Found ${response.data.data.length} student(s)`);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedBatch("");
    setSearchQuery("");
    setStudents([]);
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 3.0) return "text-blue-600";
    if (gpa >= 2.5) return "text-yellow-600";
    if (gpa >= 2.0) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Active: "bg-green-100 text-green-800",
      Graduated: "bg-blue-100 text-blue-800",
      Suspended: "bg-red-100 text-red-800",
      Withdrawn: "bg-gray-100 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Search Students
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search for students by name or ID, and filter by department or
              batch
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
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Input */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search by Name or Student ID
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter student name or ID..."
                  className="input w-full"
                  disabled={isLoading}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Department (Optional)
                  </label>
                  {isLoadingFilters ? (
                    <SkeletonLoader lines={1} className="h-10" />
                  ) : (
                    <select
                      id="department"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="input w-full"
                      disabled={isLoading}
                    >
                      <option value="">All Departments</option>
                      {filters.departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="batch"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Batch (Optional)
                  </label>
                  {isLoadingFilters ? (
                    <SkeletonLoader lines={1} className="h-10" />
                  ) : (
                    <select
                      id="batch"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="input w-full"
                      disabled={isLoading}
                    >
                      <option value="">All Batches</option>
                      {filters.batches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Students
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary flex-1 sm:flex-none"
                  disabled={isLoading}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Results */}
        {students.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="card-content">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({students.length} found)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {student.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          ID: {student.studentId}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}
                      >
                        {student.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {student.department}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Batch {student.batch}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">GPA</span>
                        <div
                          className={`text-lg font-bold ${getGPAColor(student.gpa)}`}
                        >
                          {student.gpa.toFixed(2)}
                        </div>
                      </div>
                      <a
                        href={`/check-result?id=${student.studentId}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {!isLoading && students.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
