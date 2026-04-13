// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Settings,
  BookMarked,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEbooks: 156,
    monthlyEbooks: 24,
    totalCourses: 8,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // You can implement these endpoints later
      // const response = await api.get("/dashboard/stats");
      // setStats(response.data.data);

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          title: "Introduction to Computer Science",
          course: "BSIT",
          time: "2 hours ago",
        },
        {
          id: 2,
          title: "Financial Management Principles",
          course: "BSBA-FM",
          time: "5 hours ago",
        },
        {
          id: 3,
          title: "Teaching Strategies in Elementary Education",
          course: "BEED",
          time: "1 day ago",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Welcome Banner */}
      <div className="bg-white -mt-6 -mx-6 p-6 mb-6 rounded-b-xl border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstname || "Admin"}!
        </h1>
        <p className="mt-2 text-gray-500">
          Here's what's happening with your eBook library today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total eBooks</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEbooks}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12 this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">eBooks Added This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.monthlyEbooks}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BookMarked className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Last added 2 hours ago</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCourses}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2 new courses this semester</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/upload")}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Upload New eBook
            </h3>
            <p className="text-sm text-gray-500">
              Add a new eBook to your library
            </p>
          </button>

          <button
            onClick={() => navigate("/my-courses")}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
              <BookMarked className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Courses</h3>
            <p className="text-sm text-gray-500">Organize eBooks by course</p>
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all text-left group"
          >
            <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
            <p className="text-sm text-gray-500">
              Configure your dashboard preferences
            </p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded {item.time} • Course: {item.course}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
