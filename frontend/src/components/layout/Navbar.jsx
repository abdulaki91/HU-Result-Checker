import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Menu,
  X,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Upload,
  Home,
  Search as SearchIcon,
  FileText,
  Shield,
  Smartphone,
  Sliders,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, getUserInitials } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home, public: true },
    {
      to: "/check-result",
      label: "Check Result",
      icon: FileText,
      public: true,
    },
    { to: "/search", label: "Search", icon: SearchIcon, public: true },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/upload", label: "Upload", icon: Upload },
    { to: "/admin/devices", label: "Devices", icon: Smartphone },
    { to: "/admin/statistics", label: "Statistics", icon: BarChart3 },
    { to: "/admin/column-settings", label: "Settings", icon: Sliders },
  ];

  const isActive = (path) => {
    const currentPath = location.pathname;

    // Exact match for home
    if (path === "/") {
      return currentPath === "/";
    }

    // Exact match for admin dashboard
    if (path === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/";
    }

    // For all other paths, check exact match or starts with path + "/"
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group flex-shrink-0"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg transition-all duration-300"
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Student Results
              </span>
              <p className="text-xs text-gray-600 font-medium">
                Management System
              </p>
            </div>
            {/* Mobile Logo Text */}
            <div className="block sm:hidden">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Results
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-2xl">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.to}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(link.to)
                        ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}

            {/* Admin Links */}
            {isAuthenticated && user?.role === "admin" && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                {adminLinks.slice(0, 2).map((link) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.to}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={link.to}
                        className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive(link.to)
                            ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
                            : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline ml-2">Logout</span>
                </motion.button>
              </>
            ) : (
              <Link to="/admin/login" className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-2xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-600 transition-all duration-300 border-2 border-transparent hover:border-indigo-200"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t-2 border-gray-100 overflow-hidden bg-gradient-to-b from-white to-gray-50"
            >
              <div className="py-6 space-y-2">
                {/* Public Links */}
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center mx-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                          isActive(link.to)
                            ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
                            : "text-gray-700 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:shadow-md"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-4" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                {isAuthenticated ? (
                  <>
                    {/* Admin Links for Mobile */}
                    {user?.role === "admin" && (
                      <>
                        <div className="my-4 mx-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                        </div>
                        <div className="mx-4 mb-3">
                          <p className="text-xs font-black text-gray-600 uppercase tracking-widest">
                            Admin Panel
                          </p>
                        </div>
                        {adminLinks.map((link, index) => {
                          const Icon = link.icon;
                          return (
                            <motion.div
                              key={link.to}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: (navLinks.length + index) * 0.05,
                              }}
                            >
                              <Link
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center mx-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                  isActive(link.to)
                                    ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25"
                                    : "text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md"
                                }`}
                              >
                                <Icon className="h-5 w-5 mr-4" />
                                {link.label}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </>
                    )}

                    <div className="my-4 mx-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                    </div>

                    {/* User Info */}
                    <div className="mx-4 py-4">
                      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200/50 shadow-sm">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-900 leading-tight">
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-gray-600 capitalize font-semibold">
                            {user?.role}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full mt-4 px-5 py-4 text-sm font-black text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-2xl transition-all duration-300 border-2 border-red-200 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-4 mx-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                    </div>
                    <div className="mx-4">
                      <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center w-full px-7 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-black rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500"
                        >
                          <Shield className="h-5 w-5 mr-3" />
                          Admin Login
                        </motion.button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
