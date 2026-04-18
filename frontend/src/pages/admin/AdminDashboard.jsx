import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Upload,
  BarChart3,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  RefreshCw,
  Smartphone,
  Eye,
  Sliders,
  Activity,
  Zap,
} from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getStatistics();
      setStats(response.data.data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Manage Students",
      description: "View, edit, and manage student records",
      icon: Users,
      to: "/admin/students",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Upload Results",
      description: "Import student results from Excel files",
      icon: Upload,
      to: "/admin/upload",
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Device Management",
      description: "Manage device view limits and unlock devices",
      icon: Smartphone,
      to: "/admin/devices",
      gradient: "from-indigo-500 via-purple-600 to-pink-600",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Max Views Settings",
      description: "Adjust maximum views allowed per device",
      icon: Eye,
      to: "/admin/max-views",
      gradient: "from-purple-500 via-indigo-600 to-blue-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "View Statistics",
      description: "Analyze performance and generate reports",
      icon: BarChart3,
      to: "/admin/statistics",
      gradient: "from-purple-500 via-violet-600 to-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Column Settings",
      description: "Customize which columns are displayed",
      icon: Sliders,
      to: "/admin/column-settings",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
  };

  const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl`}
      />
      <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {label}
            </p>
            <p
              className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
            >
              {value}
            </p>
          </div>
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.fullName}! 👋
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Here's what's happening with your student management system
                today.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadStatistics}
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                    <div className="h-10 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={formatNumber(stats?.overview?.totalStudents)}
              gradient="from-blue-500 to-cyan-600"
              delay={0.1}
            />
            <StatCard
              icon={BookOpen}
              label="Departments"
              value={stats?.departments?.length || 0}
              gradient="from-green-500 to-emerald-600"
              delay={0.2}
            />
            <StatCard
              icon={GraduationCap}
              label="Batches"
              value={stats?.batches?.length || 0}
              gradient="from-purple-500 to-pink-600"
              delay={0.3}
            />
            <StatCard
              icon={Award}
              label="Average GPA"
              value={
                stats?.departments?.length > 0
                  ? (
                      stats.departments.reduce(
                        (sum, dept) => sum + (dept.avgGPA || 0),
                        0,
                      ) / stats.departments.length
                    ).toFixed(2)
                  : "0.00"
              }
              gradient="from-orange-500 to-red-600"
              delay={0.4}
            />
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-500" />
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.to}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <Link to={action.to} className="group block relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl`}
                    />
                    <div className="relative bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <div
                        className={`inline-flex items-center justify-center p-3 sm:p-4 ${action.iconBg} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${action.iconColor}`}
                        />
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                        {action.title}
                      </h3>

                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                        {action.description}
                      </p>

                      <div
                        className={`flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r ${action.gradient} bg-clip-text text-transparent`}
                      >
                        <span>Get started</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-500" />
                Department Performance
              </h3>
              <Link
                to="/admin/statistics"
                className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-gray-200 rounded h-4 w-32" />
                      <div className="bg-gray-200 rounded h-4 w-24" />
                    </div>
                    <div className="bg-gray-200 rounded-full h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {stats?.departments?.slice(0, 5).map((dept, index) => (
                  <motion.div
                    key={dept._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">
                        {dept._id}
                      </span>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="text-xs text-gray-500 font-medium">
                          {dept.count} students
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-indigo-600">
                          GPA: {dept.avgGPA?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((dept.avgGPA / 4) * 100, 100)}%`,
                        }}
                        transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Batch Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-500" />
                Batch Overview
              </h3>
              <Link
                to="/admin/students"
                className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="bg-gray-200 rounded h-4 w-20" />
                    <div className="bg-gray-200 rounded h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.batches?.slice(0, 5).map((batch, index) => (
                  <motion.div
                    key={batch._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-indigo-50/50 rounded-xl hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg shadow-sm mr-3 group-hover:scale-110 transition-transform">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        Batch {batch._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-gray-900">
                        {batch.count} students
                      </div>
                      <div className="text-xs text-indigo-600 font-semibold">
                        Avg GPA: {batch.avgGPA?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Last Updated */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-full shadow-md border border-gray-100">
              <Activity className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-xs sm:text-sm text-gray-600">
                Last updated:{" "}
                <span className="font-semibold text-gray-900">
                  {new Date(stats.overview.lastUpdated).toLocaleString()}
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
