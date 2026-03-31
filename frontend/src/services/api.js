import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      if (
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

// Student API (Public)
export const studentAPI = {
  // Get student by ID
  getById: (studentId) => api.get(`/students/${encodeURIComponent(studentId)}`),

  // Search students
  search: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/students/search?${params}`);
  },

  // Get filters (departments, batches)
  getFilters: () => api.get("/students/filters"),

  // Validate student ID
  validateId: (studentId) =>
    api.get(`/students/validate/${encodeURIComponent(studentId)}`),

  // Download result PDF
  downloadPDF: (studentId) =>
    api.get(`/students/${encodeURIComponent(studentId)}/pdf`, {
      responseType: "blob",
    }),
};

// Admin API (Protected)
export const adminAPI = {
  // Students management
  getAllStudents: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return api.get(`/admin/students?${searchParams}`);
  },

  getStudentDetails: (id) => api.get(`/admin/students/${id}`),

  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),

  deleteStudent: (id) => api.delete(`/admin/students/${id}`),

  bulkDelete: (studentIds) =>
    api.delete("/admin/students/bulk", {
      data: { studentIds },
    }),

  clearAllStudents: (confirmation) =>
    api.delete("/admin/students/clear-all", {
      data: { confirmation },
    }),

  // File upload
  uploadExcel: (file, onProgress) => {
    const formData = new FormData();
    formData.append("excel", file);

    return api.post("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  // Statistics
  getStatistics: () => api.get("/admin/statistics"),
};

// Results API (Public)
export const resultAPI = {
  // Get result by student ID
  getResult: (studentId) =>
    api.get(`/results/${encodeURIComponent(studentId)}`),

  // Download transcript
  downloadTranscript: (studentId) =>
    api.get(`/results/${encodeURIComponent(studentId)}/transcript`, {
      responseType: "blob",
    }),
};

// Health check
export const healthCheck = () => api.get("/health");

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 404) {
    return "Resource not found";
  }

  if (error.response?.status === 500) {
    return "Server error. Please try again later.";
  }

  return error.message || "An unexpected error occurred";
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
