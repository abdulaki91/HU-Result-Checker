import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import LoadingSpinner, {
  CardSkeleton,
} from "../../components/common/LoadingSpinner";
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
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Upload Results",
      description: "Import student results from Excel files",
      icon: Upload,
      to: "/admin/upload",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "View Statistics",
      description: "Analyze performance and generate reports",
      icon: BarChart3,
      to: "/admin/statistics",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num?.toString() || "0";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.fullName}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your student management system
                  today.
                </p>
              </div>

              <button
                onClick={loadStatistics}
                disabled={isLoading}
                className="btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </motion.div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} className="h-32" />
            ))
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card"
              >
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Students
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats?.overview?.totalStudents)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card"
              >
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Departments
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.departments?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card"
              >
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Batches
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.batches?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Award className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Avg GPA
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.departments?.length > 0
                          ? (
                              stats.departments.reduce(
                                (sum, dept) => sum + (dept.avgGPA || 0),
                                0,
                              ) / stats.departments.length
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="card card-hover group"
                  >
                    <div className="card-content">
                      <div
                        className={`inline-flex items-center justify-center p-3 bg-gradient-to-r ${action.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {action.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4">
                        {action.description}
                      </p>

                      <div className="flex items-center text-primary-600 text-sm font-medium">
                        <span>Get started</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card"
          >
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Department Performance
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-gray-200 rounded h-4 w-32" />
                        <div className="bg-gray-200 rounded h-4 w-16" />
                      </div>
                      <div className="bg-gray-200 rounded h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.departments?.slice(0, 5).map((dept, index) => (
                    <div
                      key={dept._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {dept._id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {dept.count} students • GPA:{" "}
                            {dept.avgGPA?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min((dept.avgGPA / 4) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Batches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="card"
          >
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Batch Overview
              </h3>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="bg-gray-200 rounded h-4 w-16" />
                      <div className="bg-gray-200 rounded h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.batches?.slice(0, 5).map((batch) => (
                    <div
                      key={batch._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          Batch {batch._id}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {batch.count} students
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg GPA: {batch.avgGPA?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Last Updated */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Last updated:{" "}
            {new Date(stats.overview.lastUpdated).toLocaleString()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
