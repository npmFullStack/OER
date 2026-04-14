// Footer.jsx
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Browse eBooks", path: "/browse" },
    { name: "About OCC", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const courses = [
    { name: "BSIT", path: "/category/bsit" },
    { name: "BSBA-FM", path: "/category/bsba-fm" },
    { name: "BSBA-MM", path: "/category/bsba-mm" },
    { name: "BEED", path: "/category/beed" },
    { name: "BSED", path: "/category/bsed" },
  ];

  return (
    <footer className="bg-[#0A1A2F] text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column - Text logo matching header style */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <span className="text-2xl font-black tracking-wider whitespace-nowrap">
                <span className="text-blue-600">OCC</span>
                <span className="inline-flex items-baseline">
                  <span
                    className="font-black text-white"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 900,
                      fontSize: "1.1em",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      marginRight: "1px",
                    }}
                  >
                    e
                  </span>
                  <span className="text-white">Library</span>
                </span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 font-normal leading-relaxed max-w-xs">
              Opol Community College Digital Library
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 font-medium hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Courses
            </h3>
            <ul className="space-y-3">
              {courses.map((course, index) => (
                <li key={index}>
                  <Link
                    to={course.path}
                    className="text-sm text-gray-400 font-medium hover:text-blue-400 transition-colors"
                  >
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-5">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-400 font-medium">
                library@occ.edu.ph
              </li>
              <li className="text-sm text-gray-400 font-medium">
                +63 (123) 456-7890
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800/50 bg-[#0A1A2F]">
        <div className="container mx-auto px-4 py-5">
          <p className="text-xs text-gray-500 font-medium text-center">
            © {currentYear} Developed by Norway Mangorangca. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
