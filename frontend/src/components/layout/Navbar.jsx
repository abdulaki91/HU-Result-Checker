import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Menu,
  X,
  Search,
  User,
  LogOut,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, getUserInitials } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setShowUserMenu(false);
  };

  const navLinks = [
    { to: "/", label: "Home", public: true },
    { to: "/check-result", label: "Check Result", public: true },
    { to: "/search", label: "Search", public: true },
  ];

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/students", label: "Students", icon: User },
    { to: "/admin/upload", label: "Upload", icon: Settings },
    { to: "/admin/statistics", label: "Statistics", icon: BarChart3 },
    { to: "/admin/column-settings", label: "Column Settings", icon: Settings },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Student Results
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.fullName}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                    >
                      {user?.role === "admin" && (
                        <>
                          {adminLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                {link.label}
                              </Link>
                            );
                          })}
                          <hr className="my-1" />
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/admin/login" className="btn-primary">
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "text-primary-600 bg-primary-50"
                        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <hr className="my-2" />
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getUserInitials()}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {user?.fullName}
                        </span>
                      </div>

                      {user?.role === "admin" && (
                        <div className="space-y-1 mb-3">
                          {adminLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <Icon className="h-4 w-4 mr-3" />
                                {link.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <hr className="my-2" />
                    <Link
                      to="/admin/login"
                      onClick={() => setIsOpen(false)}
                      className="block mx-3 btn-primary text-center"
                    >
                      Admin Login
                    </Link>
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
