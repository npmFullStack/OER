// components/layout/Header.jsx
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Grid,
  Info,
  LogIn,
  Menu,
  X,
  Library,
  ChevronDown,
} from "lucide-react";
import logo from "@/assets/images/logo.webp";
import { useState, useEffect, useRef } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const isHomePage =
    location.pathname === "/" || location.pathname === "/login";

  // Get search mode from localStorage or default to 'ebooks'
  const [searchMode, setSearchMode] = useState(() => {
    return localStorage.getItem("searchMode") || "ebooks";
  });

  // Toggle search mode
  const toggleSearchMode = (mode) => {
    const newMode = mode;
    setSearchMode(newMode);
    localStorage.setItem("searchMode", newMode);
    setIsSearchDropdownOpen(false);

    // Dispatch custom event so Home component can listen
    window.dispatchEvent(
      new CustomEvent("searchModeChange", { detail: newMode }),
    );
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "All eBooks", path: "/browse", icon: Compass },
    { name: "About", path: "/about", icon: Info },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };

    // Listen for search mode changes from other components
    const handleSearchModeChange = (event) => {
      setSearchMode(event.detail);
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("searchModeChange", handleSearchModeChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("searchModeChange", handleSearchModeChange);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Determine header styles based on scroll position and current page
  const getHeaderClasses = () => {
    if (isHomePage && !isScrolled) {
      return "bg-transparent absolute top-0 left-0 right-0 z-50 shadow-none border-none";
    }
    return "bg-white/90 backdrop-blur-sm border-b border-borderLight sticky top-0 z-50 shadow-sm";
  };

  // Determine text color based on scroll position and current page
  const getTextColorClasses = (isMobile = false) => {
    if (isHomePage && !isScrolled) {
      return "text-white hover:text-white/80";
    }
    return isMobile
      ? "text-textPrimary"
      : "text-textSecondary hover:text-primary";
  };

  // Get OCC color based on scroll position
  const getOCCColor = () => {
    if (isHomePage && !isScrolled) {
      return "text-blue-600"; // Light blue color
    }
    return "text-primary"; // Default deep blue
  };

  // Get eRead color based on scroll position
  const getEReadColor = () => {
    if (isHomePage && !isScrolled) {
      return "text-white";
    }
    return "text-textPrimary";
  };

  // Determine button styles
  const getButtonClasses = (type = "login") => {
    if (type === "library") {
      if (isHomePage && !isScrolled) {
        return "bg-white/10 text-white hover:bg-white/20";
      }
      return "bg-gray-100 text-gray-700 hover:bg-gray-200";
    }

    // Login button styles
    if (isHomePage && !isScrolled) {
      return "bg-primary hover:bg-primaryDark text-white border border-white/20";
    }
    return "bg-primary hover:bg-primaryDark text-white";
  };

  // Get active state for search options
  const isActive = (mode) => {
    return searchMode === mode;
  };

  // Get button text based on search mode
  const getButtonText = () => {
    return searchMode === "ebooks" ? "Search eBooks" : "Search Books";
  };

  return (
    <header className={getHeaderClasses()}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src={logo}
              alt="OCC eRead"
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-extrabold tracking-wider">
              <span className={getOCCColor()}>OCC</span>
              <span className={getEReadColor()}>eRead</span>
            </span>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 font-medium transition-colors tracking-wide relative ${
                    isHomePage && !isScrolled
                      ? "text-white hover:text-white/80"
                      : "text-textSecondary hover:text-primary"
                  } ${isActive && !isHomePage ? "text-primary" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                  {isActive && !isHomePage && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-800 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Books Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm ${
                  isActive("books") && !isHomePage
                    ? "bg-blue-600 text-white"
                    : getButtonClasses("library")
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{getButtonText()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSearchDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Active bottom border for Search Books when in books mode */}
              {isActive("books") && !isHomePage && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-800 rounded-full" />
              )}

              {/* Dropdown Menu */}
              {isSearchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <button
                    onClick={() => toggleSearchMode("ebooks")}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isActive("ebooks")
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Search eBooks
                  </button>
                  <button
                    onClick={() => toggleSearchMode("books")}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isActive("books")
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Search Books
                  </button>
                </div>
              )}
            </div>

            {/* Admin Login Button */}
            <Link
              to="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm ${getButtonClasses(
                "login",
              )}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomePage && !isScrolled
                ? "text-white hover:bg-white/10"
                : "text-textSecondary hover:bg-gray-100"
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-borderLight animate-slideDown">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-4 mb-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-textSecondary hover:bg-gray-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Search Options */}
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500 px-3 mb-2">
                    Search Options
                  </p>
                  <button
                    onClick={() => {
                      toggleSearchMode("ebooks");
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors w-full text-left ${
                      isActive("ebooks")
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Library className="w-5 h-5" />
                    <span className="font-medium">Search eBooks</span>
                  </button>
                  <button
                    onClick={() => {
                      toggleSearchMode("books");
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors w-full text-left ${
                      isActive("books")
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Library className="w-5 h-5" />
                    <span className="font-medium">Search Books</span>
                  </button>
                </div>
              </nav>

              {/* Mobile CTA Button */}
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 bg-primary hover:bg-primaryDark text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
