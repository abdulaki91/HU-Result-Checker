import { useState } from "react";
import {
  Search,
  Eye,
  Clock,
  Wifi,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import api from "../services/api";

const WhoViewedMePage = () => {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewData, setViewData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!studentId.trim()) {
      setError("Please enter your Student ID");
      return;
    }

    setLoading(true);
    setError("");
    setViewData(null);

    try {
      const response = await api.get(
        `/students/view-attempts/${encodeURIComponent(studentId.trim())}`,
      );

      if (response.data.success) {
        setViewData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch view attempts");
      }
    } catch (err) {
      console.error("Error fetching view attempts:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch view attempts. Please check your Student ID and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDeviceId = (deviceId) => {
    // Show only first 8 characters for privacy
    return deviceId.substring(0, 8) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Eye className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Who Viewed My Results?
          </h1>
          <p className="text-lg text-gray-600">
            Enter your Student ID to see which devices tried to view your
            results
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., CS-2023-001 or just 001"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can enter your full Student ID or just the numeric part
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Check View Attempts"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {viewData && (
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {viewData.student.fullName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Student ID:</span>{" "}
                      {viewData.student.studentId}
                    </p>
                    <p>
                      <span className="font-medium">Department:</span>{" "}
                      {viewData.student.department}
                    </p>
                    <p>
                      <span className="font-medium">Batch:</span>{" "}
                      {viewData.student.batch}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">
                      Total View Attempts
                    </p>
                    <p className="text-4xl font-bold">
                      {viewData.totalViewAttempts}
                    </p>
                  </div>
                  <Eye className="w-12 h-12 text-blue-200 opacity-80" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">
                      Unique Devices
                    </p>
                    <p className="text-4xl font-bold">
                      {viewData.uniqueDevices}
                    </p>
                  </div>
                  <Wifi className="w-12 h-12 text-purple-200 opacity-80" />
                </div>
              </div>
            </div>

            {/* Device List */}
            {viewData.devices.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Devices That Viewed Your Results
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Each device is identified by a unique fingerprint
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {viewData.devices.map((device, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Wifi className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium text-gray-900">
                              Device {index + 1}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {formatDeviceId(device.deviceId)}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {device.viewCount}{" "}
                          {device.viewCount === 1 ? "view" : "views"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <div>
                            <p className="text-xs text-gray-500">
                              First viewed
                            </p>
                            <p className="font-medium">
                              {formatDate(device.firstViewedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <div>
                            <p className="text-xs text-gray-500">Last viewed</p>
                            <p className="font-medium">
                              {formatDate(device.lastViewedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {device.ipAddresses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            IP Address(es):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {device.ipAddresses.map((ip, ipIndex) => (
                              <span
                                key={ipIndex}
                                className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-mono text-gray-700"
                              >
                                {ip}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {device.viewers && device.viewers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">
                            Student(s) who viewed from this device:
                          </p>
                          <div className="space-y-2">
                            {device.viewers.map((viewer, viewerIndex) => (
                              <div
                                key={viewerIndex}
                                className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-100"
                              >
                                <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {viewer.fullName}
                                  </p>
                                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                                    <span className="font-mono">
                                      {viewer.studentId}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span>{viewer.department}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <Eye className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Views Yet
                </h3>
                <p className="text-gray-600">
                  No one has tried to view your results yet.
                </p>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Privacy Notice</p>
                  <p>
                    Device IDs are anonymized and truncated for privacy. This
                    feature helps you monitor who is accessing your academic
                    information. If you notice suspicious activity, please
                    contact your administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhoViewedMePage;
