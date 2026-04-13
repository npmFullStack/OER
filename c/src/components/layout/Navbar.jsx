// src/components/layout/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
  BookOpen,
  Mail,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/images/logo.webp";

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New eBook uploaded",
      message: "Introduction to Computing was added",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Download milestone",
      message: "Your eBook reached 100 downloads",
      time: "1 hour ago",
      read: false,
    },
  ]);

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-[#F5F5F5] fixed top-0 left-0 right-0 z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and menu toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="OCC eRead"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-extrabold tracking-wider">
                <span className="text-primary">OCC</span>
                <span className="text-gray-900">eRead</span>
              </span>
            </Link>
          </div>

          {/* Right section - Notifications and User menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                !notification.read
                                  ? "bg-primary/10"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Bell
                                className={`w-4 h-4 ${
                                  !notification.read
                                    ? "text-primary"
                                    : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user
                        ? `${user.firstname} ${user.lastname}`
                        : "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "admin@occ.edu"}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  {/* User info header */}
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user
                            ? `${user.firstname} ${user.lastname}`
                            : "Admin User"}
                        </p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/my-ebooks"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>My eBooks</span>
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
