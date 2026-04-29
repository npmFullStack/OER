// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  ChevronRight,
  LogOut,
  GraduationCap,
  Library,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import WarningModal from "@/components/modals/WarningModal";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle body scroll lock when mobile drawer is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  // Define menu items based on user role
  const getAllMenuItems = () => {
    const items = [
      { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
      { path: "/my-ebooks", name: "My eBooks", icon: BookOpen },
      { path: "/books", name: "My Books", icon: Library },
      { path: "/student-research", name: "Student Research", icon: FileText },
      { path: "/programs", name: "Programs", icon: GraduationCap },
      { path: "/settings", name: "Settings", icon: Settings },
    ];

    // Only show Users menu for superadmin (both formats)
    const userRole = user?.role?.toLowerCase();
    if (userRole === "superadmin" || userRole === "super_admin") {
      items.push({ path: "/users", name: "Admins", icon: Users });
    }

    return items;
  };

  const menuItems = getAllMenuItems();

  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    } ${!isOpen ? "justify-center" : ""}`;
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate("/login");
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.firstname
      ? user.firstname.charAt(0).toUpperCase()
      : "";
    const lastInitial = user.lastname
      ? user.lastname.charAt(0).toUpperCase()
      : "";
    return firstInitial + lastInitial || "U";
  };

  // Get full name
  const getFullName = () => {
    if (!user) return "Admin User";
    return (
      `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Admin User"
    );
  };

  // Get user role display
  const getRoleDisplay = () => {
    if (!user) return "";
    const role = user.role?.toLowerCase();
    return role === "superadmin" || role === "super_admin"
      ? "Super Admin"
      : "Admin";
  };

  const sidebarContent = (
    <>
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={getNavLinkClass}
                  title={!isOpen ? item.name : ""}
                  onClick={handleLinkClick}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {item.name}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* User Config Section - Fixed at bottom */}
      <div className="border-t border-gray-200 p-3">
        {isOpen ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getFullName()}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-blue-600 truncate font-medium mt-0.5">
                  {getRoleDisplay()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  // Mobile: Drawer with overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={onClose}
            aria-label="Close sidebar overlay"
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#F5F5F5] transition-transform duration-300 z-40 flex flex-col w-64 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>

        {/* Logout Warning Modal */}
        <WarningModal
          isOpen={showLogoutModal}
          onClose={handleCancelLogout}
          onConfirm={handleConfirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to logout? You will need to login again to access your account."
          confirmText="Logout"
          cancelText="Cancel"
          isDanger={true}
        />
      </>
    );
  }

  // Desktop: Persistent sidebar
  return (
    <>
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#F5F5F5] transition-all duration-300 z-40 flex flex-col ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Logout Warning Modal */}
      <WarningModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default Sidebar;
