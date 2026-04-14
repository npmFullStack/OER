// src/components/layout/ProtectedLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Calculate margin for main content (desktop only)
  const getMainMargin = () => {
    if (isMobile) return "ml-0";
    return sidebarOpen ? "ml-64" : "ml-20";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main
          className={`flex-1 transition-all duration-300 ${getMainMargin()} p-6 mt-16`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
