// src/components/StudentResearchTab.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, X, FileText, Download, Eye } from "lucide-react";
import Pagination from "./Pagination";

// Mock student research data (Capstone, Business Research, FS, AR, ET)
const MOCK_RESEARCH = [
  {
    id: 1,
    title: "E-Learning Platform Usability Study for Remote Education",
    authors: "MADAYAG, MANGORANGCA, ABIEZA, MENDIOLA",
    category: "CAPSTONE",
    year: 2024,
    downloads: 234,
    views: 567,
    file_url: "#",
  },
  {
    id: 2,
    title: "Mobile Application for Campus Navigation and Facility Locator",
    authors: "SANTOS, REYES, GONZALES, CRUZ",
    category: "CAPSTONE",
    year: 2024,
    downloads: 189,
    views: 423,
    file_url: "#",
  },
  {
    id: 3,
    title:
      "Financial Literacy and Spending Habits Among Young Adults in Metro Manila",
    authors: "TAN, RIVERA, MENDOZA, VILLANUEVA",
    category: "BUSINESS RESEARCH",
    year: 2023,
    downloads: 156,
    views: 342,
    file_url: "#",
  },
  {
    id: 4,
    title:
      "Digital Marketing Strategies for Small and Medium Enterprises Post-Pandemic",
    authors: "YU, TORRES, RAMIREZ, FLORES",
    category: "BUSINESS RESEARCH",
    year: 2024,
    downloads: 278,
    views: 589,
    file_url: "#",
  },
  {
    id: 5,
    title:
      "Feasibility Study: Establishing a Solar-Powered Charging Station Network",
    authors: "FERNANDEZ, CRUZ, SANTOS, VILLANUEVA",
    category: "FEASIBILITY STUDY",
    year: 2024,
    downloads: 198,
    views: 456,
    file_url: "#",
  },
  {
    id: 6,
    title:
      "Action Research: Improving Reading Comprehension Through Digital Tools",
    authors: "MERCADO, CASTILLO, GARCIA, REYES",
    category: "ACTION RESEARCH",
    year: 2023,
    downloads: 145,
    views: 321,
    file_url: "#",
  },
  {
    id: 7,
    title:
      "Action Research: Classroom Management Strategies for Multigrade Classrooms",
    authors: "FERNANDEZ, SANTOS, MENDOZA, TORRES",
    category: "ACTION RESEARCH",
    year: 2024,
    downloads: 167,
    views: 389,
    file_url: "#",
  },
  {
    id: 8,
    title: "Experimental Thesis: Gamification Effects on Student Engagement",
    authors: "ROMERO, DIZON, AQUINO, CASTRO",
    category: "EXPERIMENTAL THESIS",
    year: 2024,
    downloads: 312,
    views: 678,
    file_url: "#",
  },
  {
    id: 9,
    title:
      "Experimental Thesis: Blended Learning vs Traditional Classroom Performance",
    authors: "VILLANUEVA, CRUZ, MENDOZA, SANTOS",
    category: "EXPERIMENTAL THESIS",
    year: 2023,
    downloads: 223,
    views: 534,
    file_url: "#",
  },
  {
    id: 10,
    title: "Feasibility Study: Automated Library Kiosk System",
    authors: "GONZALES, RAMIREZ, FLORES, TAN",
    category: "FEASIBILITY STUDY",
    year: 2024,
    downloads: 178,
    views: 412,
    file_url: "#",
  },
];

const getCategoryColor = (category) => {
  const colors = {
    CAPSTONE: "bg-red-100 text-red-700",
    "BUSINESS RESEARCH": "bg-green-100 text-green-700",
    "FEASIBILITY STUDY": "bg-yellow-100 text-yellow-700",
    "ACTION RESEARCH": "bg-blue-100 text-blue-700",
    "EXPERIMENTAL THESIS": "bg-blue-100 text-blue-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

const formatNumber = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const StudentResearchTab = () => {
  const [research, setResearch] = useState([]);
  const [filteredResearch, setFilteredResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Load mock data
  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setResearch(MOCK_RESEARCH);
      setFilteredResearch(MOCK_RESEARCH);
      setLoading(false);
    };
    load();
  }, []);

  // Get unique values for filters
  const uniqueCategories = [
    "CAPSTONE",
    "BUSINESS RESEARCH",
    "FEASIBILITY STUDY",
    "ACTION RESEARCH",
    "EXPERIMENTAL THESIS",
  ];
  // Generate years 2017-2026
  const uniqueYears = Array.from({ length: 10 }, (_, i) => 2026 - i);

  // Apply filters
  useEffect(() => {
    let filtered = [...research];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.authors?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    if (selectedYear) {
      filtered = filtered.filter((r) => r.year === parseInt(selectedYear));
    }

    setFilteredResearch(filtered);
    setCurrentPage(1);
  }, [research, search, selectedCategory, selectedYear]);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredResearch.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredResearch.length / ITEMS_PER_PAGE);

  const activeFilters = [search, selectedCategory, selectedYear].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedYear("");
  };

  const handleDownload = (title) => {
    console.log(`Downloading research: ${title}`);
  };

  const handleView = (title) => {
    console.log(`Viewing research: ${title}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredResearch.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Research Found
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search or filters
        </p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or category..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
            showFilters || activeFilters > 0
              ? "border-primary text-primary bg-primary/5"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filter Research</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Showing {startIdx + 1}–
          {Math.min(startIdx + ITEMS_PER_PAGE, filteredResearch.length)} of{" "}
          {filteredResearch.length} research entries
        </p>
      </div>

      {/* Research cards */}
      <div className="space-y-4">
        {currentItems.map((item) => {
          const categoryBadgeClass = getCategoryColor(item.category);
          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`${categoryBadgeClass} text-xs font-semibold px-2 py-0.5 rounded-full`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="font-semibold text-textPrimary mb-2 text-base md:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-sm text-textSecondary">
                      <span className="font-medium">Authors:</span>{" "}
                      {item.authors}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(item.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        {formatNumber(item.downloads)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(item.title);
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.title);
                        }}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default StudentResearchTab;
