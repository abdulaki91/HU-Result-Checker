import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Download,
  Plus,
  RefreshCw,
} from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import LoadingSpinner, {
  TableSkeleton,
} from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import EditStudentModal from "../../components/admin/EditStudentModal";
import ConfirmModal from "../../components/common/ConfirmModal";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ departments: [], batches: [] });
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentMaxViews, setCurrentMaxViews] = useState(10); // Default fallback
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    onConfirm: null,
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Fetch current max views setting
  const fetchCurrentMaxViews = async () => {
    try {
      const response = await adminAPI.getCurrentMaxViews();
      setCurrentMaxViews(response.data.data.currentMaxViews);
    } catch (error) {
      console.error("Error fetching current max views:", error);
      // Keep default fallback of 10 if fetch fails
    }
  };

  useEffect(() => {
    loadStudents();
  }, [currentPage, selectedDepartment, selectedBatch]);

  useEffect(() => {
    fetchCurrentMaxViews();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedDepartment && { department: selectedDepartment }),
        ...(selectedBatch && { batch: selectedBatch }),
      };

      const response = await adminAPI.getAllStudents(params);
      setStudents(response.data.data);
      setPagination(response.data.pagination);

      // Extract unique filters from current data
      const departments = [
        ...new Set(response.data.data.map((s) => s.department)),
      ].sort();
      const batches = [...new Set(response.data.data.map((s) => s.batch))]
        .sort()
        .reverse();
      setFilters({ departments, batches });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadStudents();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadStudents();
  };

  const handleResetViewCount = async (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      type: "warning",
      title: "Reset View Count",
      message: `Are you sure you want to reset the view count for ${studentName}? This will unlock the student's record and reset all device view counts to zero.`,
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await adminAPI.resetStudentViewCount(studentId);
          toast.success("View count reset successfully");
          loadStudents();
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          const errorMessage = handleApiError(error);
          toast.error(errorMessage);
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  const handleDelete = async (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Delete Student",
      message: `Are you sure you want to delete ${studentName}? This action cannot be undone and will permanently remove all associated data.`,
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await adminAPI.deleteStudent(studentId);
          toast.success("Student deleted successfully");
          loadStudents();
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error) {
          const errorMessage = handleApiError(error);
          toast.error(errorMessage);
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Graduated: "bg-blue-100 text-blue-800",
      Suspended: "bg-red-100 text-red-800",
      Withdrawn: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Management
            </h1>
            <p className="text-gray-600">
              Manage student records, view details, and perform bulk operations
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="btn-primary"
            onClick={() => toast.info("Add student feature coming soon!")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </motion.button>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="card-content">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or student ID..."
                    className="input w-full"
                  />
                </div>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input"
                >
                  <option value="">All Departments</option>
                  {filters.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="input"
                >
                  <option value="">All Batches</option>
                  {filters.batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("");
                    setSelectedBatch("");
                    setCurrentPage(1);
                    loadStudents();
                  }}
                  className="btn-secondary"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="card-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Students {pagination.total && `(${pagination.total} total)`}
              </h2>
            </div>

            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.studentId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.batch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${getGPAColor(parseFloat(student.gpa) || 0)}`}
                          >
                            {(parseFloat(student.gpa) || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span
                              className={`font-medium ${
                                student.isViewLocked
                                  ? "text-red-600"
                                  : (student.viewCount || 0) >=
                                      (student.maxViews || currentMaxViews) *
                                        0.8
                                    ? "text-orange-600"
                                    : "text-gray-900"
                              }`}
                            >
                              {student.viewCount || 0}/
                              {student.maxViews || currentMaxViews}
                            </span>
                          </div>
                          {student.isViewLocked && (
                            <div className="text-xs text-red-500">Locked</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit student"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {(student.viewCount > 0 ||
                              student.isViewLocked) && (
                              <button
                                onClick={() =>
                                  handleResetViewCount(
                                    student.id,
                                    student.fullName,
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900"
                                title="Reset view count"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDelete(student.id, student.fullName)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Delete student"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {students.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No students found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria or upload some student
                      data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} results
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        isLoading={isConfirmLoading}
        confirmText={confirmModal.type === "danger" ? "Delete" : "Reset"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default StudentsPage;
