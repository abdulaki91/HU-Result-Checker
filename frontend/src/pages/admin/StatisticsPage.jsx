import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Award, Download, RefreshCw } from 'lucide-react'
import { adminAPI, handleApiError } from '../../services/api'
import LoadingSpinner, { CardSkeleton } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const StatisticsPage = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getStatistics()
      setStats(response.data.data)
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num?.toString() || '0'
  }

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return 'text-green-600'
    if (gpa >= 3.0) return 'text-blue-600'
    if (gpa >= 2.5) return 'text-yellow-600'
    if (gpa >= 2.0) return 'text-orange-600'
    return 'text-red-600'
  }

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
              Statistics & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive overview of student performance and system metrics
            </p>
          </motion.div>

          <div className="flex space-x-3">
            <button
              onClick={loadStatistics}
              disabled={isLoading}
              className="btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => toast.info('Export feature coming soon!')}
              className="btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Cards */}
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
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
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
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Departments</p>
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
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Batches</p>
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
                      <p className="text-sm font-medium text-gray-600">Overall GPA</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.departments?.length > 0 
                          ? (stats.departments.reduce((sum, dept) => sum + (dept.avgGPA || 0), 0) / stats.departments.length).toFixed(2)
                          : '0.00'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card mb-8"
        >
          <div className="card-content">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Department Performance
            </h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-gray-200 rounded h-4 w-48" />
                      <div className="bg-gray-200 rounded h-4 w-24" />
                    </div>
                    <div className="bg-gray-200 rounded h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {stats?.departments?.map((dept, index) => (
                  <div key={dept._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {dept._id}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {dept.count} students
                        </div>
                        <div className={`text-lg font-semibold ${getGPAColor(dept.avgGPA)}`}>
                          GPA: {dept.avgGPA?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((dept.avgGPA / 4) * 100, 100)}%`
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.0</span>
                      <span>4.0</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Batch Analysis & Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Batch Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card"
          >
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Batch Analysis
              </h3>
              
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="bg-gray-200 rounded h-4 w-16" />
                      <div className="bg-gray-200 rounded h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.batches?.map((batch) => (
                    <div key={batch._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          Batch {batch._id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {batch.count} students
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getGPAColor(batch.avgGPA)}`}>
                          {batch.avgGPA?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-xs text-gray-500">Avg GPA</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Grade Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="card"
          >
            <div className="card-content">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grade Distribution
              </h3>
              
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center justify-between">
                      <div className="bg-gray-200 rounded h-4 w-8" />
                      <div className="bg-gray-200 rounded h-2 flex-1 mx-3" />
                      <div className="bg-gray-200 rounded h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.grades?.slice(0, 8).map((grade) => {
                    const maxCount = Math.max(...(stats?.grades?.map(g => g.count) || [1]))
                    const percentage = (grade.count / maxCount) * 100
                    
                    return (
                      <div key={grade._id} className="flex items-center">
                        <div className="w-8 text-sm font-medium text-gray-700">
                          {grade._id}
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right">
                          {grade.count}
                        </div>
                      </div>
                    )
                  })}
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
            Last updated: {new Date(stats.overview.lastUpdated).toLocaleString()}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default StatisticsPage