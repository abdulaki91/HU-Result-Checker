import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  GraduationCap,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: Search,
      title: "Quick Result Check",
      description:
        "Enter your student ID to instantly view your academic results and performance.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BookOpen,
      title: "Detailed Transcripts",
      description:
        "Access comprehensive course-wise grades, GPA, and academic history.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Performance Analytics",
      description:
        "Track your academic progress with detailed performance insights.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Multi-Department Support",
      description:
        "Supports all departments with batch-wise result management.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const stats = [
    { label: "Students Served", value: "10,000+", icon: Users },
    { label: "Departments", value: "15+", icon: BookOpen },
    { label: "Results Processed", value: "50,000+", icon: TrendingUp },
    { label: "Success Rate", value: "99.9%", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-indigo-50 py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                <span className="block">Student Result</span>
                <span className="gradient-text">Management System</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 text-balance">
                Access your academic results instantly with our modern, secure,
                and user-friendly platform
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link to="/check-result" className="btn-primary btn-lg group">
                <Search className="h-5 w-5 mr-2" />
                Check Your Result
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link to="/search" className="btn-secondary btn-lg">
                <Users className="h-5 w-5 mr-2" />
                Browse Results
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-sm mb-2">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-xl mb-4">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the future of academic result management with our
                cutting-edge features
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card card-hover group"
                >
                  <div className="card-content text-center">
                    <div
                      className={`inline-flex items-center justify-center p-3 bg-gradient-to-r ${feature.color} rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Check Your Results?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who trust our platform for their
              academic result management
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/check-result"
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold"
              >
                <Search className="h-5 w-5 mr-2" />
                Check Results Now
              </Link>

              <Link
                to="/search"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Browse All Results
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get your results in three simple steps
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Student ID",
                description:
                  "Input your unique student identification number in the search field",
              },
              {
                step: "02",
                title: "Verify Information",
                description:
                  "System validates your ID and retrieves your academic records securely",
              },
              {
                step: "03",
                title: "View Results",
                description:
                  "Access your complete results with grades, GPA, and performance analytics",
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-2xl font-bold text-xl mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
