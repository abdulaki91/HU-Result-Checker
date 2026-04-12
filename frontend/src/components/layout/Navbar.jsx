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
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Student Results
              </span>
              <p className="text-xs text-gray-500 font-medium">
                Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.to)
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Dropdown or Direct Links */}
            {isAuthenticated && user?.role === "admin" && (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
                {adminLinks.slice(0, 3).map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive(link.to)
                          ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
                          : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-bold text-gray-900">
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
                  className="flex items-center px-4 py-2 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden xl:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <Link to="/admin/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-6 py-2.5 ml-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-indigo-600 transition-all duration-200"
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
              className="lg:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="py-4 space-y-1">
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
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive(link.to)
                            ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                            : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
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
                        <div className="my-3 px-4">
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        </div>
                        <div className="px-4 mb-2">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                  isActive(link.to)
                                    ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
                                    : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                                }`}
                              >
                                <Icon className="h-5 w-5 mr-3" />
                                {link.label}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </>
                    )}

                    <div className="my-3 px-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>

                    {/* User Info */}
                    <div className="px-4 py-3">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            {user?.fullName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user?.role}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full mt-3 px-4 py-3 text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-600"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-3 px-4">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>
                    <div className="px-4">
                      <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Shield className="h-5 w-5 mr-2" />
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
