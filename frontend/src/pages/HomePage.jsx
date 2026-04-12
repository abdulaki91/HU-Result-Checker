import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, GraduationCap, Users, ArrowRight } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl mb-8 shadow-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                <span className="block mb-2">Student Result</span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
                Check your academic results quickly and securely
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/check-result">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <Search className="h-6 w-6 mr-3" />
                  Check Your Result
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/search">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
                >
                  <Users className="h-6 w-6 mr-3" />
                  Browse Students
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
