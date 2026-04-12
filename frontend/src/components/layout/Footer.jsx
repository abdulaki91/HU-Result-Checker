import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-gray-300 text-sm flex items-center justify-center">
            © 2026 Abdulaki. All rights reserved.
            <span className="mx-2">•</span>
            Made with{" "}
            <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" /> in
            Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
