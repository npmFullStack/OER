// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Settings,
  BookMarked,
  TrendingUp,
  Clock,
  GraduationCap,
  Library,
  ChevronRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats] = useState({
    totalEbooks: 156,
    monthlyEbooks: 24,
    totalBooks: 342,
    monthlyBooks: 18,
    totalPrograms: 12,
    newPrograms: 2,
  });

  // Monthly eBook upload data for line chart
  const monthlyData = [
    { month: "Jan", ebooks: 12, books: 8 },
    { month: "Feb", ebooks: 15, books: 10 },
    { month: "Mar", ebooks: 18, books: 12 },
    { month: "Apr", ebooks: 22, books: 15 },
    { month: "May", ebooks: 24, books: 18 },
    { month: "Jun", ebooks: 28, books: 20 },
    { month: "Jul", ebooks: 32, books: 22 },
    { month: "Aug", ebooks: 35, books: 25 },
    { month: "Sep", ebooks: 38, books: 28 },
    { month: "Oct", ebooks: 42, books: 30 },
    { month: "Nov", ebooks: 45, books: 32 },
    { month: "Dec", ebooks: 48, books: 35 },
  ];

  // Program distribution data for pie chart
  const programDistribution = [
    { name: "BSIT", value: 45, color: "#3b82f6" },
    { name: "BSCS", value: 32, color: "#10b981" },
    { name: "BSCpE", value: 28, color: "#f59e0b" },
    { name: "BSECE", value: 18, color: "#8b5cf6" },
    { name: "BSEE", value: 15, color: "#ef4444" },
    { name: "BSME", value: 12, color: "#06b6d4" },
    { name: "Others", value: 6, color: "#6b7280" },
  ];

  // Top resources data for bar chart
  const topResources = [
    { name: "Introduction to Programming", downloads: 342 },
    { name: "Web Development Fundamentals", downloads: 567 },
    { name: "Data Structures", downloads: 289 },
    { name: "Database Systems", downloads: 412 },
    { name: "Machine Learning", downloads: 512 },
  ];

  const [recentActivity] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      type: "ebook",
      program: "BSIT",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Financial Management Principles",
      type: "book",
      program: "BSBA-FM",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Teaching Strategies in Elementary Education",
      type: "ebook",
      program: "BEED",
      time: "1 day ago",
    },
    {
      id: 4,
      title: "Data Structures and Algorithms",
      type: "book",
      program: "BSCS",
      time: "2 days ago",
    },
    {
      id: 5,
      title: "Artificial Intelligence Fundamentals",
      type: "ebook",
      program: "BSCS",
      time: "3 days ago",
    },
  ]);

  const quickActions = [
    {
      id: "upload",
      label: "Upload New eBook",
      icon: Upload,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBg: "hover:bg-blue-50",
      path: "/upload",
      description: "Add a new eBook to your library",
    },
    {
      id: "add-book",
      label: "Add New Book",
      icon: Library,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      hoverBg: "hover:bg-green-50",
      path: "/books/new",
      description: "Add a physical book record",
    },
    {
      id: "manage-programs",
      label: "Manage Programs",
      icon: GraduationCap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      hoverBg: "hover:bg-purple-50",
      path: "/programs",
      description: "Organize resources by program",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
      hoverBg: "hover:bg-gray-50",
      path: "/settings",
      description: "Configure your dashboard preferences",
    },
  ];

  const getActivityIcon = (type) => {
    if (type === "ebook") {
      return <BookOpen className="w-4 h-4 text-blue-600" />;
    }
    return <Library className="w-4 h-4 text-green-600" />;
  };

  const getActivityBgColor = (type) => {
    if (type === "ebook") {
      return "bg-blue-50";
    }
    return "bg-green-50";
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Admin!
          </h1>
          <p className="mt-2 text-gray-500">
            Here's what's happening with your library today.
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Stats and Charts */}
          <div className="flex-1">
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <StatCard
                title="Total eBooks"
                value={stats.totalEbooks}
                icon={BookOpen}
                trend={`+${stats.monthlyEbooks} this month`}
                trendUp={true}
              />

              <StatCard
                title="Total Books"
                value={stats.totalBooks}
                icon={Library}
                trend={`+${stats.monthlyBooks} this month`}
                trendUp={true}
              />

              <StatCard
                title="Total Programs"
                value={stats.totalPrograms}
                icon={GraduationCap}
                trend={`+${stats.newPrograms} new this semester`}
                trendUp={true}
              />

              <StatCard
                title="Total Resources"
                value={stats.totalEbooks + stats.totalBooks}
                icon={BookMarked}
                description="eBooks + Books"
              />
            </div>

            {/* Monthly Trends Chart - Line/Area Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Monthly Resource Trends
                  </h2>
                  <p className="text-sm text-gray-500">
                    eBook and book additions over time
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorEbooks"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ebooks"
                    name="eBooks"
                    stroke="#3b82f6"
                    fill="url(#colorEbooks)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="books"
                    name="Books"
                    stroke="#10b981"
                    fill="url(#colorBooks)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Two Column Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Program Distribution - Pie Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Program Distribution
                    </h2>
                    <p className="text-sm text-gray-500">
                      Resources by program
                    </p>
                  </div>
                  <PieChart className="w-5 h-5 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={programDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {programDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {programDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Resources - Bar Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Top Resources
                    </h2>
                    <p className="text-sm text-gray-500">
                      Most downloaded eBooks
                    </p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={topResources}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#6b7280"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="downloads"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    >
                      {topResources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500">
                  Latest resource additions
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`${getActivityBgColor(item.type)} p-2 rounded-lg`}
                      >
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.type === "ebook" ? "Uploaded" : "Added"}{" "}
                          {item.time} • Program: {item.program} • Type:{" "}
                          {item.type === "ebook" ? "eBook" : "Physical Book"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions (Vertical) */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <p className="text-sm text-gray-500">Frequently used tools</p>
              </div>
              <div className="p-4 space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.path)}
                    className={`w-full ${action.hoverBg} rounded-lg p-4 transition-all text-left group border border-gray-100 hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`${action.iconBg} p-2 rounded-lg group-hover:scale-105 transition-transform`}
                      >
                        <action.icon
                          className={`w-5 h-5 ${action.iconColor}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {action.label}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Stats Summary */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">
                    TODAY'S SUMMARY
                  </span>
                  <Clock className="w-3 h-3 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New eBooks</span>
                    <span className="font-semibold text-gray-900">+3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New Books</span>
                    <span className="font-semibold text-gray-900">+2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-gray-900">1,247</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Downloads Today</span>
                    <span className="font-semibold text-blue-600">+89</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
