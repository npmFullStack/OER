// components/layout/Header.jsx
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Grid, Info, LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logoSvg from "@/assets/images/logo.svg";

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

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

  // Get eLibrary color based on scroll position - matches hero section
  const getELibraryColor = () => {
    if (isHomePage && !isScrolled) {
      return "text-white";
    }
    return "text-textPrimary";
  };

  // Determine button styles for login
  const getLoginButtonClasses = () => {
    if (isHomePage && !isScrolled) {
      return "bg-blue-600 hover:bg-primaryDark text-white border border-white/20";
    }
    return "bg-primary hover:bg-primaryDark text-white";
  };

  // Determine mobile menu button color
  const getMobileMenuButtonClasses = () => {
    if (isHomePage && !isScrolled) {
      return "text-white hover:bg-white/10";
    }
    return "text-textSecondary hover:bg-gray-100";
  };

  return (
    <header className={getHeaderClasses()}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand - Matching hero section style */}
          <Link to="/" className="flex items-center gap-1">
            <img src={logoSvg} alt="OCC Logo" className="h-8 w-auto" />
            <span className="text-2xl font-black tracking-wider whitespace-nowrap">
              <span className="text-blue-600">OCC</span>
              <span className="inline-flex items-baseline">
                <span
                  className={getELibraryColor()}
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
                <span className={getELibraryColor()}>Library</span>
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links - Centered */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
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

          {/* Mobile Menu Button - Always visible on mobile, styling changes based on scroll */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${getMobileMenuButtonClasses()}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Fixed positioning relative to viewport */}
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu Drawer - Always white background */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden animate-slideInRight">
              {/* Close button inside drawer */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col h-full pt-16 pb-6">
                {/* Mobile Navigation Links */}
                <nav className="flex-1 px-4 space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-textSecondary hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-base">
                          {link.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4 mx-4" />

                {/* Mobile CTA Button */}
                <div className="px-4 mt-4">
                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 bg-primary hover:bg-primaryDark text-white px-4 py-3 rounded-xl transition-all duration-300 font-medium w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Admin Login</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;
