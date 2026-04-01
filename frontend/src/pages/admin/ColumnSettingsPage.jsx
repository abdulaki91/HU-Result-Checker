import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  Save,
  Info,
  User,
  BookOpen,
  Calculator,
  Database,
} from "lucide-react";
import { columnSettingsAPI, handleApiError } from "../../services/api";

const ColumnSettingsPage = () => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchColumnSettings();
  }, []);

  const fetchColumnSettings = async () => {
    try {
      setLoading(true);
      const response = await columnSettingsAPI.getAll();
      setColumns(response.data.data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = (id) => {
    setColumns(
      columns.map((col) =>
        col.id === id ? { ...col, isVisible: !col.isVisible } : col,
      ),
    );
  };

  const handleColumnNameChange = (id, newName) => {
    setColumns(
      columns.map((col) =>
        col.id === id ? { ...col, columnName: newName } : col,
      ),
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItem === null) return;

    const newColumns = [...columns];
    const draggedColumn = newColumns[draggedItem];

    // Remove dragged item
    newColumns.splice(draggedItem, 1);

    // Insert at new position
    newColumns.splice(dropIndex, 0, draggedColumn);

    // Update display order
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      displayOrder: index + 1,
    }));

    setColumns(updatedColumns);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await columnSettingsAPI.updateBulk(columns);
      toast.success("Column settings saved successfully!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all column settings to defaults? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await columnSettingsAPI.reset();
      setColumns(response.data.data);
      toast.success("Column settings reset to defaults!");
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getColumnTypeIcon = (type) => {
    switch (type) {
      case "student_info":
        return <User className="h-4 w-4 text-blue-500" />;
      case "marks":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "calculated":
        return <Calculator className="h-4 w-4 text-purple-500" />;
      case "metadata":
        return <Database className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getColumnTypeColor = (type) => {
    switch (type) {
      case "student_info":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "marks":
        return "bg-green-50 text-green-700 border-green-200";
      case "calculated":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "metadata":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading column settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Column Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Customize which columns are displayed in student results and
              search results. Drag to reorder, toggle visibility, and edit
              column names.
            </p>
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium text-blue-700">Student Info</span>
            </div>
            <p className="text-sm text-blue-600">
              Basic student information like name, ID, department
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <BookOpen className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium text-green-700">Marks</span>
            </div>
            <p className="text-sm text-green-600">
              Individual assessment marks like quiz, midterm, final
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Calculator className="h-5 w-5 text-purple-500 mr-2" />
              <span className="font-medium text-purple-700">Calculated</span>
            </div>
            <p className="text-sm text-purple-600">
              Computed values like total marks, grade, GPA
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Database className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">Metadata</span>
            </div>
            <p className="text-sm text-gray-600">
              System information like creation date, status
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-8 justify-between items-center"
        >
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleReset}
              disabled={saving}
              className="btn-secondary flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {columns.filter((col) => col.isVisible).length}
            </span>{" "}
            of <span className="font-medium">{columns.length}</span> columns
            visible
          </div>
        </motion.div>

        {/* Column Settings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="card-content p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {columns.map((column, index) => (
                    <tr
                      key={column.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`hover:bg-gray-50 transition-colors ${
                        draggedItem === index ? "opacity-50" : ""
                      } ${!column.isVisible ? "bg-gray-50" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {column.displayOrder}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {column.columnKey}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColumnTypeColor(column.columnType)}`}
                        >
                          {getColumnTypeIcon(column.columnType)}
                          <span className="ml-1 capitalize">
                            {column.columnType.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={column.columnName}
                          onChange={(e) =>
                            handleColumnNameChange(column.id, e.target.value)
                          }
                          className="text-sm text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded px-2 py-1"
                          disabled={saving}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleVisibility(column.id)}
                          disabled={column.isRequired || saving}
                          className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            column.isVisible
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          } ${column.isRequired ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          title={
                            column.isRequired
                              ? "This column is required and cannot be hidden"
                              : ""
                          }
                        >
                          {column.isVisible ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs">
                          {column.description}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">How to use Column Settings:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Drag rows using the grip handle to reorder columns</li>
                <li>
                  Click the visibility toggle to show/hide columns in student
                  results
                </li>
                <li>Edit display names by clicking on the column name field</li>
                <li>
                  Required columns (marked with lock icon) cannot be hidden
                </li>
                <li>
                  Changes apply to both admin views and public student search
                  results
                </li>
                <li>Don't forget to save your changes!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ColumnSettingsPage;
