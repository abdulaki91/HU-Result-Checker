import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import toast from "react-hot-toast";
import QuickActionButton from "../../components/common/QuickActionButton";

const MaxViewsPage = () => {
  const [maxViews, setMaxViews] = useState(6);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateResult, setLastUpdateResult] = useState(null);

  // Fetch current max views setting when component mounts
  const fetchCurrentMaxViews = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getCurrentMaxViews();
      setMaxViews(response.data.data.currentMaxViews);
      console.log(
        `📊 Current max views: ${response.data.data.currentMaxViews}`,
      );
    } catch (error) {
      console.error("❌ Error fetching current max views:", error);
      toast.error("Failed to load current max views setting");
      // Keep default value of 6 if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  // Load current max views on component mount
  React.useEffect(() => {
    fetchCurrentMaxViews();
  }, []);

  const handleUpdateMaxViews = async () => {
    // Validate input
    if (maxViews < 1 || maxViews > 50) {
      toast.error("Max views must be between 1 and 50");
      return;
    }

    setIsUpdating(true);
    try {
      console.log(`🔄 Updating max views to ${maxViews}...`);

      const response = await adminAPI.updateAllMaxViews(maxViews);

      console.log("✅ Success:", response.data);

      setLastUpdateResult({
        success: true,
        message: response.data.message,
        devicesUpdated: response.data.data.devicesUpdated,
        totalDevices: response.data.data.totalDevices,
        timestamp: new Date().toLocaleString(),
      });

      toast.success(`Successfully updated max views to ${maxViews}!`);
    } catch (error) {
      console.error("❌ Error:", error);

      setLastUpdateResult({
        success: false,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toLocaleString(),
      });

      const errorMessage = handleApiError(error);
      toast.error(`Failed to update: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl mr-4">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Max Views Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Adjust the maximum number of views allowed per device
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Device View Limit Configuration
            </h2>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Maximum Views Per Device
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={maxViews}
                    onChange={(e) => setMaxViews(parseInt(e.target.value) || 1)}
                    disabled={isLoading}
                    className="w-full h-16 px-6 text-2xl font-bold text-center rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={isLoading ? "Loading..." : "6"}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">views</span>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {isLoading
                    ? "Loading current setting..."
                    : "Enter a value between 1 and 50 views per device"}
                </p>
              </div>

              {/* Action Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Apply Changes
                </label>
                <QuickActionButton
                  onClick={handleUpdateMaxViews}
                  disabled={isLoading || maxViews < 1 || maxViews > 50}
                  loading={isUpdating}
                  icon={Eye}
                  variant="primary"
                  size="lg"
                  loadingText="Updating..."
                  className="w-full"
                >
                  Update All Devices
                </QuickActionButton>
                <p className="mt-3 text-sm text-gray-600">
                  This will update the view limit for all existing and new
                  devices
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Result Display */}
        {lastUpdateResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-lg border-2 ${
              lastUpdateResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            } overflow-hidden`}
          >
            <div
              className={`px-6 py-4 ${
                lastUpdateResult.success
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
            >
              <h3 className="text-lg font-bold text-white flex items-center">
                {lastUpdateResult.success ? (
                  <CheckCircle className="h-6 w-6 mr-2" />
                ) : (
                  <AlertCircle className="h-6 w-6 mr-2" />
                )}
                {lastUpdateResult.success
                  ? "Update Successful"
                  : "Update Failed"}
              </h3>
            </div>

            <div className="p-6">
              <p
                className={`text-lg font-medium mb-2 ${
                  lastUpdateResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {lastUpdateResult.message}
              </p>

              {lastUpdateResult.success && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600">Devices Updated</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lastUpdateResult.devicesUpdated}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600">Total Devices</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lastUpdateResult.totalDevices}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Last updated: {lastUpdateResult.timestamp}
              </p>
            </div>
          </motion.div>
        )}

        {/* Information Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Current Behavior
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Each device can view student results up to the limit</li>
                <li>• After reaching the limit, the device gets locked</li>
                <li>• Locked devices cannot view more results</li>
                <li>• Admins can unlock devices manually</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">After Update</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All existing devices get the new limit</li>
                <li>• New devices will use the new limit</li>
                <li>• Previously locked devices remain locked</li>
                <li>• Changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaxViewsPage;
