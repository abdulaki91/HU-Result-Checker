import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // warning, danger, success, info
  isLoading = false,
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonBg:
        "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
      borderColor: "border-yellow-200",
    },
    danger: {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      borderColor: "border-red-200",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonBg:
        "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
      borderColor: "border-green-200",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg:
        "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
      borderColor: "border-blue-200",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className={`border-b ${config.borderColor} p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${config.iconBg} p-3 rounded-xl flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 text-base leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-6 py-2.5 text-sm font-bold text-white ${config.buttonBg} rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
