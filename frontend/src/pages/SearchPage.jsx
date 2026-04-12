import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  BookOpen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

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
    setShowLoadingOverlay(true);
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
      setShowLoadingOverlay(false);
    }
  };

  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedBatch("");
    setSearchQuery("");
    setStudents([]);
  };

  const getGPAColor = (gpa) => {
    if (gpa == null) return "text-gray-600";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border-2 border-white/50"
            >
              <LoadingSpinner
                variant="gradient"
                text="Searching students..."
                size="lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-5xl sm:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Search Students
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Discover student profiles with advanced search and filtering
            </p>
          </motion.div>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-12"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
              >
                <Search className="h-4 w-4 mr-2 text-indigo-500" />
                Search by Name or Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter student name or ID..."
                  className="w-full h-14 px-6 pr-12 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300"
                  disabled={isLoading}
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
                  Department (Optional)
                </label>
                {isLoadingFilters ? (
                  <SkeletonLoader lines={1} className="h-14" />
                ) : (
                  <select
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-base font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
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
                  className="block text-sm font-semibold text-gray-700 mb-3 flex items-center"
                >
                  <GraduationCap className="h-4 w-4 mr-2 text-pink-500" />
                  Batch (Optional)
                </label>
                {isLoadingFilters ? (
                  <SkeletonLoader lines={1} className="h-14" />
                ) : (
                  <select
                    id="batch"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full h-14 px-6 rounded-2xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-base font-medium focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300"
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
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <motion.button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
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
                    Search Students
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={clearFilters}
                className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold text-base hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter className="h-5 w-5 mr-2" />
                Clear Filters
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {students.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-center justify-between"
              >
                <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3 text-indigo-600" />
                  Search Results
                </h2>
                <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-2xl shadow-lg">
                  {students.length}{" "}
                  {students.length === 1 ? "Student" : "Students"}
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student, index) => (
                  <motion.div
                    key={student.id || student.studentId}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatusColor(student.status)}`}
                      >
                        {student.status}
                      </span>
                    </div>

                    <div className="mb-5">
                      <h3 className="text-xl font-display font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {student.fullName}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-lg">
                        {student.studentId}
                      </p>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-xl">
                        <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="font-medium">
                          {student.department}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700 bg-pink-50 px-3 py-2 rounded-xl">
                        <GraduationCap className="h-4 w-4 mr-2 text-pink-600" />
                        <span className="font-medium">
                          Batch {student.batch}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          GPA
                        </span>
                        <div
                          className={`text-2xl font-bold ${getGPAColor(student.gpa)}`}
                        >
                          {student.gpa != null ? student.gpa.toFixed(2) : "N/A"}
                        </div>
                      </div>
                      <motion.a
                        href={`/check-result?id=${student.studentId}`}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details
                        <span className="ml-1">→</span>
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        <AnimatePresence>
          {!isLoading && students.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6"
              >
                <Users className="h-16 w-16 text-gray-400" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                No students found
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find what
                you're looking for
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
