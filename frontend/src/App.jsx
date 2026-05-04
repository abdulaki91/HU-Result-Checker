import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import CheckResultPage from "./pages/CheckResultPage";
import SearchPage from "./pages/SearchPage";
import WhoViewedMePage from "./pages/WhoViewedMePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import UploadPage from "./pages/admin/UploadPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import ColumnSettingsPage from "./pages/admin/ColumnSettingsPage";
import DeviceManagementPage from "./pages/admin/DeviceManagementPage";
import MaxViewsPage from "./pages/admin/MaxViewsPage";

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Error Boundary
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/check-result" element={<CheckResultPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/who-viewed-me" element={<WhoViewedMePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute>
                      <StudentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/upload"
                  element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/statistics"
                  element={
                    <ProtectedRoute>
                      <StatisticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/column-settings"
                  element={
                    <ProtectedRoute>
                      <ColumnSettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/devices"
                  element={
                    <ProtectedRoute>
                      <DeviceManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/max-views"
                  element={
                    <ProtectedRoute>
                      <MaxViewsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Page */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-[60vh] flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-300 mb-4">
                          404
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                          Page not found
                        </p>
                        <a href="/" className="btn-primary">
                          Go Home
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
