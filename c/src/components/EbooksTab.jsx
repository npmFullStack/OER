// src/components/EbooksTab.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, X, BookOpen } from "lucide-react";
import EbookCard from "@/components/EbookCard";
import Pagination from "./Pagination";

const yearOptions = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-downloaded", label: "Most Downloaded" },
  { value: "least-downloaded", label: "Least Downloaded" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getProgramColorBadge = (program) => {
  const colors = {
    BSIT: "bg-red-100 text-red-700",
    "BSBA-FM": "bg-yellow-100 text-yellow-700",
    "BSBA-MM": "bg-yellow-100 text-yellow-700",
    BSED: "bg-blue-100 text-blue-700",
    BEED: "bg-blue-100 text-blue-700",
    "GEN ED": "bg-green-100 text-green-700",
  };
  return colors[program] || "bg-gray-100 text-gray-700";
};

const EbooksTab = ({ ebooks, loading, onDownload }) => {
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Get unique programs
  const uniquePrograms = [...new Set(ebooks.map((b) => b.program_acronym))];

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...ebooks];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.uploader_name?.toLowerCase().includes(q) ||
          b.program_name?.toLowerCase().includes(q) ||
          b.program_acronym?.toLowerCase().includes(q),
      );
    }

    if (selectedProgram) {
      filtered = filtered.filter(
        (b) => String(b.program_acronym) === selectedProgram,
      );
    }

    filtered.sort((a, b) => {
      switch (selectedSort) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "most-downloaded":
          return (b.downloads || 0) - (a.downloads || 0);
        case "least-downloaded":
          return (a.downloads || 0) - (b.downloads || 0);
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });

    setFilteredEbooks(filtered);
    setPage(1);
  }, [ebooks, search, selectedProgram, selectedSort]);

  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredEbooks.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(filteredEbooks.length / ITEMS_PER_PAGE);

  const activeFilters = [search, selectedProgram].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedProgram("");
    setSelectedSort("newest");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="bg-gray-200" style={{ height: "200px" }} />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredEbooks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No eBooks Found
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
            placeholder="Search by title, author, or program..."
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
            <h3 className="font-semibold text-gray-900">Filter eBooks</h3>
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
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Programs</option>
                {uniquePrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
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
          {Math.min(startIdx + ITEMS_PER_PAGE, filteredEbooks.length)} of{" "}
          {filteredEbooks.length} eBooks
        </p>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {currentItems.map((ebook) => (
          <div key={ebook.id} style={{ cursor: "default" }}>
            <EbookCard
              ebook={ebook}
              onDownload={onDownload}
              getProgramColor={getProgramColorBadge}
              formatFileSize={formatFileSize}
              formatDownloads={formatDownloads}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default EbooksTab;
