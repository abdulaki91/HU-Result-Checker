import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI, handleApiError } from "../../services/api";

const EditStudentModal = ({ student, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    department: "",
    batch: "",
    semester: "",
    academicYear: "",
    email: "",
    phone: "",
    status: "",
    viewCount: 0,
    maxViews: 6,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName || "",
        studentId: student.studentId || "",
        department: student.department || "",
        batch: student.batch || "",
        semester: student.semester || "",
        academicYear: student.academicYear || "",
        email: student.email && student.email !== "N/A" ? student.email : "",
        phone: student.phone && student.phone !== "N/A" ? student.phone : "",
        status: student.status || "Active",
        viewCount: student.viewCount || 0,
        maxViews: student.maxViews || 6,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be 2-100 characters";
    }

    // Student ID validation
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^[A-Za-z0-9\-\/\.\s]+$/.test(formData.studentId)) {
      newErrors.studentId = "Invalid student ID format";
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    // Batch validation
    if (!formData.batch) {
      newErrors.batch = "Batch is required";
    } else if (!/^\d{4}$/.test(formData.batch)) {
      newErrors.batch = "Batch must be a 4-digit year (e.g., 2024)";
    }

    // Semester validation
    if (!formData.semester) {
      newErrors.semester = "Semester is required";
    }

    // Academic Year validation
    if (!formData.academicYear) {
      newErrors.academicYear = "Academic year is required";
    } else if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
      newErrors.academicYear =
        "Academic year must be in format YYYY-YYYY (e.g., 2024-2025)";
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && formData.email.trim() && formData.email !== "N/A") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && formData.phone.trim() && formData.phone !== "N/A") {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone =
          "Phone must be 10-15 digits with optional +, spaces, dashes, or parentheses";
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Max Views validation
    if (!formData.maxViews || formData.maxViews < 1) {
      newErrors.maxViews = "Max views must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data - convert empty email/phone to N/A
      const submitData = {
        ...formData,
        email: formData.email && formData.email.trim() ? formData.email : "N/A",
        phone: formData.phone && formData.phone.trim() ? formData.phone : "N/A",
      };

      console.log("Submitting student update:", submitData);
      await adminAPI.updateStudent(student.id, submitData);
      toast.success("Student updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.msg).join(", ")
        : handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit Student</h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`input ${errors.fullName ? "border-red-500" : ""}`}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`input ${errors.studentId ? "border-red-500" : ""}`}
                  placeholder="e.g., UGPR0001/15"
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentId}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`input ${errors.department ? "border-red-500" : ""}`}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Software Engineering">
                    Software Engineering
                  </option>
                  <option value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">
                    Business Administration
                  </option>
                  <option value="Economics">Economics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Other">Other</option>
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  pattern="\d{4}"
                  className={`input ${errors.batch ? "border-red-500" : ""}`}
                  placeholder="e.g., 2024"
                />
                {errors.batch && (
                  <p className="mt-1 text-sm text-red-600">{errors.batch}</p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`input ${errors.semester ? "border-red-500" : ""}`}
                >
                  <option value="">Select Semester</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                )}
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  pattern="\d{4}-\d{4}"
                  className={`input ${errors.academicYear ? "border-red-500" : ""}`}
                  placeholder="e.g., 2024-2025"
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicYear}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? "border-red-500" : ""}`}
                  placeholder="student@example.com (leave empty if not available)"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="+1234567890 (leave empty if not available)"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="Active">Active</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              {/* View Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Count
                </label>
                <input
                  type="number"
                  name="viewCount"
                  value={formData.viewCount}
                  onChange={handleChange}
                  min="0"
                  className="input"
                  placeholder="0"
                />
              </div>

              {/* Max Views */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Views Allowed
                </label>
                <input
                  type="number"
                  name="maxViews"
                  value={formData.maxViews}
                  onChange={handleChange}
                  min="1"
                  required
                  className="input"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
