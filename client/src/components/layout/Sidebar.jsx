// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Users,
  Settings,
  ChevronRight,
  User,
  LogOut,
  GraduationCap,
  Library,
} from "lucide-react";

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/upload", name: "Upload eBook", icon: Upload },
    { path: "/my-ebooks", name: "My eBooks", icon: BookOpen },
    { path: "/my-courses", name: "My Courses", icon: GraduationCap },
    { path: "/settings", name: "Settings", icon: Settings },
  ];

  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-primary text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-primary"
    } ${!isOpen ? "justify-center" : ""}`;
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#F5F5F5] transition-all duration-300 z-40 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Navigation Menu - Takes remaining space */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={getNavLinkClass}
                  title={!isOpen ? item.name : ""}
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
          // Expanded view
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">admin@occ.edu</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Handle logout
                console.log("Logout clicked");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>
        ) : (
          // Collapsed view
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <button
              onClick={() => {
                // Handle logout
                console.log("Logout clicked");
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
