// components/layout/Header.jsx
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Grid, Info, LogIn, Menu, X } from "lucide-react";
import logo from "@/assets/images/logo.webp";
import { useState, useEffect } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage =
    location.pathname === "/" || location.pathname === "/login";

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "All eBooks", path: "/browse", icon: Compass },
    { name: "About", path: "/about", icon: Info },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

  // Determine button styles for login
  const getLoginButtonClasses = () => {
    if (isHomePage && !isScrolled) {
      return "bg-primary hover:bg-primaryDark text-white border border-white/20";
    }
    return "bg-primary hover:bg-primaryDark text-white";
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
              <span className={getEReadColor()}>eLibrary</span>
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
            {/* Admin Login Button */}
            <Link
              to="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg text-sm ${getLoginButtonClasses()}`}
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
