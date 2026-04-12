import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Monitor,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  History,
} from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const DeviceManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockAllModal, setShowUnlockAllModal] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    // Reset to page 1 when search parameters change
    if (page !== 1) {
      setPage(1);
    } else {
      loadDevices();
    }
  }, [showAll, studentIdSearch]);

  useEffect(() => {
    loadDevices();
  }, [page]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        showAll: showAll.toString(),
      };

      // Add student ID search if provided
      if (studentIdSearch.trim()) {
        params.studentId = studentIdSearch.trim();
      }

      console.log("🔍 Loading devices with params:", params);

      const response = await adminAPI.getDevices(params);

      console.log("✅ Response received:", {
        deviceCount: response.data.data.length,
        totalItems: response.data.pagination.totalItems,
        searchInfo: response.data.searchInfo,
      });

      setDevices(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      setSearchInfo(response.data.searchInfo || null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      console.error("❌ Error loading devices:", error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockDevice = async (deviceId) => {
    try {
      await adminAPI.unlockDevice(deviceId);
      toast.success("Device unlocked successfully!");
      loadDevices();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleUnlockAll = async () => {
    try {
      const response = await adminAPI.unlockAllDevices();
      toast.success(response.data.message);
      setShowUnlockAllModal(false);
      loadDevices();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;

    try {
      await adminAPI.deleteDevice(selectedDevice.deviceId);
      toast.success("Device deleted successfully!");
      setShowDeleteModal(false);
      setSelectedDevice(null);
      loadDevices();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  const filteredDevices = devices.filter((device) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      device.deviceId.toLowerCase().includes(query) ||
      device.ipAddress?.toLowerCase().includes(query) ||
      device.userAgent?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (device) => {
    if (device.isLocked || device.viewCount >= device.maxViews) {
      return "text-red-600 bg-red-50";
    }
    if (device.viewCount >= device.maxViews * 0.8) {
      return "text-orange-600 bg-orange-50";
    }
    return "text-green-600 bg-green-50";
  };

  const getStatusIcon = (device) => {
    if (device.isLocked || device.viewCount >= device.maxViews) {
      return <Lock className="h-4 w-4" />;
    }
    return <Unlock className="h-4 w-4" />;
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const truncateDeviceId = (deviceId) => {
    if (deviceId.length <= 20) return deviceId;
    return `${deviceId.substring(0, 10)}...${deviceId.substring(deviceId.length - 10)}`;
  };

  const toggleRow = (deviceId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mr-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Device Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage device view limits and unlock locked devices
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Devices</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalItems}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Monitor className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Locked Devices</p>
                  <p className="text-3xl font-bold text-red-600">
                    {
                      devices.filter(
                        (d) => d.isLocked || d.viewCount >= d.maxViews,
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Devices</p>
                  <p className="text-3xl font-bold text-green-600">
                    {
                      devices.filter(
                        (d) => !d.isLocked && d.viewCount < d.maxViews,
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex flex-col gap-4">
              {/* Student ID Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search by Student ID
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter full or partial student ID (e.g., 0010/15 or UGPR0010/15)..."
                      value={studentIdSearch}
                      onChange={(e) =>
                        setStudentIdSearch(e.target.value.toUpperCase())
                      }
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Tip: You can search with partial ID (e.g., "0010" will
                    find "UGPR0010/15")
                  </p>
                  {searchInfo && (
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                      {searchInfo.message}
                    </p>
                  )}
                </div>
                {studentIdSearch && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setStudentIdSearch("");
                        setSearchInfo(null);
                      }}
                      className="h-12 px-6 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-all"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Device Search & Actions */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Device Search */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Devices
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by device ID, IP address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowAll(!showAll)}
                  className={`h-12 px-6 rounded-xl font-semibold transition-all flex items-center ${
                    showAll
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  {showAll ? "Show Locked Only" : "Show All"}
                </button>

                {/* Unlock All Button */}
                <button
                  onClick={() => setShowUnlockAllModal(true)}
                  className="h-12 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all flex items-center"
                >
                  <Unlock className="h-5 w-5 mr-2" />
                  Unlock All
                </button>

                {/* Refresh Button */}
                <button
                  onClick={loadDevices}
                  className="h-12 px-6 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-all flex items-center"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Devices Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner variant="gradient" text="Loading devices..." />
          </div>
        ) : filteredDevices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <Smartphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No devices found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search query"
                : showAll
                  ? "No devices have been registered yet"
                  : "No locked devices found"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Device ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Students Viewed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Last Viewed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDevices.map((device, index) => (
                    <React.Fragment key={device.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleRow(device.deviceId)}
                              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {expandedRows.has(device.deviceId) ? (
                                <ChevronUp className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                            <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-mono font-medium text-gray-900">
                                {truncateDeviceId(device.deviceId)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {formatDate(device.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(device)}`}
                          >
                            {getStatusIcon(device)}
                            <span className="ml-2">
                              {device.isLocked ||
                              device.viewCount >= device.maxViews
                                ? "Locked"
                                : "Active"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-semibold text-gray-900">
                              {device.viewCount}/{device.maxViews}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                device.viewCount >= device.maxViews
                                  ? "bg-red-500"
                                  : device.viewCount >= device.maxViews * 0.8
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                              }`}
                              style={{
                                width: `${(device.viewCount / device.maxViews) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-semibold text-indigo-600">
                              {device.totalStudentsViewed || 0} student(s)
                            </span>
                          </div>
                          {device.studentIds &&
                            device.studentIds.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {device.studentIds
                                  .slice(0, 2)
                                  .map((sid, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded font-mono"
                                    >
                                      {sid}
                                    </span>
                                  ))}
                                {device.studentIds.length > 2 && (
                                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{device.studentIds.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDate(device.lastViewedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-900">
                            {device.ipAddress || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(device.isLocked ||
                              device.viewCount >= device.maxViews) && (
                              <button
                                onClick={() =>
                                  handleUnlockDevice(device.deviceId)
                                }
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title="Unlock device"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedDevice(device);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                              title="Delete device"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Row - View History */}
                      <AnimatePresence>
                        {expandedRows.has(device.deviceId) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-indigo-50 to-purple-50"
                          >
                            <td colSpan="7" className="px-6 py-4">
                              <div className="flex items-start space-x-2 mb-3">
                                <History className="h-5 w-5 text-indigo-600 mt-0.5" />
                                <h4 className="text-sm font-bold text-gray-900">
                                  View History (Last 10 views)
                                </h4>
                              </div>
                              {device.viewHistory &&
                              device.viewHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-indigo-200">
                                    <thead className="bg-indigo-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-900">
                                          #
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-900">
                                          Student ID
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-900">
                                          Viewed At
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-indigo-900">
                                          IP Address
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-indigo-100">
                                      {device.viewHistory.map((view, idx) => (
                                        <tr
                                          key={view.id}
                                          className="hover:bg-indigo-50 transition-colors"
                                        >
                                          <td className="px-4 py-2 text-xs text-gray-600">
                                            {idx + 1}
                                          </td>
                                          <td className="px-4 py-2 text-sm font-mono font-semibold text-indigo-700">
                                            {view.studentId}
                                          </td>
                                          <td className="px-4 py-2 text-xs text-gray-600">
                                            {formatDate(view.viewedAt)}
                                          </td>
                                          <td className="px-4 py-2 text-xs font-mono text-gray-600">
                                            {view.ipAddress || "N/A"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">
                                  No view history available
                                </p>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * 20 + 1} to{" "}
                  {Math.min(page * 20, totalItems)} of {totalItems} devices
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Delete Device?
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this device? This action
                  cannot be undone. The device will be able to view results
                  again with a fresh count.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDevice}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unlock All Confirmation Modal */}
        <AnimatePresence>
          {showUnlockAllModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowUnlockAllModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <Unlock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Unlock All Devices?
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  This will reset the view count for all locked devices. They
                  will be able to view results again up to the maximum limit.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnlockAllModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnlockAll}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Unlock All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeviceManagementPage;
