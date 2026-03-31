import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { adminAPI, handleApiError } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please select a valid Excel file (.xls or .xlsx)");
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await adminAPI.uploadExcel(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadResult(response.data.data);
      toast.success("File uploaded and processed successfully!");
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadResult(null);
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Upload Student Results
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Import student results from Excel files. Supports multiple
              departments and batch imports.
            </p>
          </motion.div>
        </div>

        {/* Upload Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card mb-8"
        >
          <div className="card-content">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Excel File Format Requirements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Required Columns:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full Name</li>
                  <li>• Student ID</li>
                  <li>• Department</li>
                  <li>• Batch (4-digit year)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Optional Columns:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Email</li>
                  <li>• Phone</li>
                  <li>• Semester</li>
                  <li>• Academic Year</li>
                  <li>• Course details (course1_code, course1_name, etc.)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Each sheet in your Excel file can
                represent a different department or batch. The system will
                process all sheets automatically.
              </p>
            </div>
          </div>
        </motion.div>

        {/* File Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card mb-8"
        >
          <div className="card-content">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary-500 bg-primary-50"
                  : file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center space-x-4">
                  <FileSpreadsheet className="h-12 w-12 text-green-600" />
                  <div className="text-left">
                    <p className="text-lg font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your Excel file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Supports .xls and .xlsx files up to 10MB
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer inline-flex"
                  >
                    Select File
                  </label>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Uploading and processing...
                  </span>
                  <span className="text-sm text-gray-600">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {file && !isUploading && (
              <div className="mt-6 text-center">
                <button onClick={handleUpload} className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload and Process File
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upload Results */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="card-content">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload Results
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResult.totalProcessed}
                  </div>
                  <div className="text-sm text-gray-600">
                    Students Processed
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadResult.sheets?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sheets Processed</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResult.totalErrors}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>

              {/* Sheet Details */}
              {uploadResult.sheets && uploadResult.sheets.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Sheet Processing Details:
                  </h3>
                  <div className="space-y-3">
                    {uploadResult.sheets.map((sheet, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {sheet.sheet}
                          </span>
                          <span className="text-sm text-gray-600">
                            {sheet.processed}/{sheet.total} processed
                          </span>
                        </div>

                        {sheet.errors && sheet.errors.length > 0 && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-red-600 hover:text-red-700">
                                {sheet.errors.length} error(s) - Click to view
                              </summary>
                              <div className="mt-2 space-y-1">
                                {sheet.errors
                                  .slice(0, 5)
                                  .map((error, errorIndex) => (
                                    <div
                                      key={errorIndex}
                                      className="text-red-600 text-xs"
                                    >
                                      {error.row && `Row ${error.row}: `}
                                      {error.error}
                                    </div>
                                  ))}
                                {sheet.errors.length > 5 && (
                                  <div className="text-xs text-gray-500">
                                    ... and {sheet.errors.length - 5} more
                                    errors
                                  </div>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
