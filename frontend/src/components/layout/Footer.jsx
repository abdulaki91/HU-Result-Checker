import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-300 text-sm">
          © {currentYear} Abdulaki. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
