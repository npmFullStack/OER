// src/components/layout/ProtectedLayout.jsx
import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          } p-6 mt-16`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
