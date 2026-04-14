// src/pages/Ebooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import EbookCard from "../components/EbookCard";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROGRAMS = [
  { id: 1, name: "BSIT", acronym: "BSIT" },
  { id: 2, name: "BSBA-FM", acronym: "BSBA-FM" },
  { id: 3, name: "BSBA-MM", acronym: "BSBA-MM" },
  { id: 4, name: "BSED", acronym: "BSED" },
  { id: 5, name: "BEED", acronym: "BEED" },
  { id: 6, name: "GEN ED", acronym: "GEN ED" },
];

const EBOOKS_DATA = [
  {
    id: "1",
    program_id: 1,
    title: "Introduction to Programming",
    file_name: "intro-programming.pdf",
    file_size: 2048000,
    file_url: "#",
    cover_url: null,
    downloads: 342,
    views: 1200,
    created_at: "2024-01-10T08:00:00Z",
    uploader_name: "John Doe",
  },
  {
    id: "2",
    program_id: 1,
    title: "Data Structures and Algorithms",
    file_name: "dsa.pdf",
    file_size: 3145728,
    file_url: "#",
    cover_url: null,
    downloads: 289,
    views: 890,
    created_at: "2024-01-15T08:00:00Z",
    uploader_name: "Jane Smith",
  },
  {
    id: "3",
    program_id: 1,
    title: "Database Management Systems",
    file_name: "dbms.pdf",
    file_size: 4194304,
    file_url: "#",
    cover_url: null,
    downloads: 412,
    views: 1540,
    created_at: "2024-02-01T08:00:00Z",
    uploader_name: "Mike Johnson",
  },
  {
    id: "4",
    program_id: 2,
    title: "Financial Management Principles",
    file_name: "financial-mgmt.pdf",
    file_size: 5242880,
    file_url: "#",
    cover_url: null,
    downloads: 198,
    views: 670,
    created_at: "2024-01-20T08:00:00Z",
    uploader_name: "Sarah Wilson",
  },
  {
    id: "5",
    program_id: 2,
    title: "Investment Analysis",
    file_name: "investment-analysis.pdf",
    file_size: 6291456,
    file_url: "#",
    cover_url: null,
    downloads: 321,
    views: 980,
    created_at: "2024-02-10T08:00:00Z",
    uploader_name: "Robert Brown",
  },
  {
    id: "6",
    program_id: 3,
    title: "Marketing Management",
    file_name: "marketing-mgmt.pdf",
    file_size: 3670016,
    file_url: "#",
    cover_url: null,
    downloads: 156,
    views: 520,
    created_at: "2024-03-01T08:00:00Z",
    uploader_name: "Emily Davis",
  },
  {
    id: "7",
    program_id: 3,
    title: "Consumer Behavior",
    file_name: "consumer-behavior.pdf",
    file_size: 4718592,
    file_url: "#",
    cover_url: null,
    downloads: 234,
    views: 810,
    created_at: "2024-03-15T08:00:00Z",
    uploader_name: "David Miller",
  },
  {
    id: "8",
    program_id: 4,
    title: "Educational Psychology",
    file_name: "edu-psychology.pdf",
    file_size: 2621440,
    file_url: "#",
    cover_url: null,
    downloads: 567,
    views: 2100,
    created_at: "2024-04-01T08:00:00Z",
    uploader_name: "Lisa Anderson",
  },
  {
    id: "9",
    program_id: 4,
    title: "Teaching Methodologies",
    file_name: "teaching-methods.pdf",
    file_size: 7340032,
    file_url: "#",
    cover_url: null,
    downloads: 445,
    views: 1680,
    created_at: "2024-04-15T08:00:00Z",
    uploader_name: "Mark Taylor",
  },
  {
    id: "10",
    program_id: 5,
    title: "Early Childhood Education",
    file_name: "early-childhood.pdf",
    file_size: 5767168,
    file_url: "#",
    cover_url: null,
    downloads: 123,
    views: 430,
    created_at: "2024-05-01T08:00:00Z",
    uploader_name: "Patricia Thomas",
  },
  {
    id: "11",
    program_id: 5,
    title: "Child Development Theories",
    file_name: "child-dev.pdf",
    file_size: 3932160,
    file_url: "#",
    cover_url: null,
    downloads: 378,
    views: 1350,
    created_at: "2024-05-10T08:00:00Z",
    uploader_name: "Kevin White",
  },
  {
    id: "12",
    program_id: 6,
    title: "World History",
    file_name: "world-history.pdf",
    file_size: 8388608,
    file_url: "#",
    cover_url: null,
    downloads: 512,
    views: 1920,
    created_at: "2024-05-20T08:00:00Z",
    uploader_name: "Nancy Harris",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const Ebooks = () => {
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");

  // Pagination - Display only 3 cards per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Program color mapping (same as EbookCard expects)
  const getProgramColor = (programName) => {
    const colors = {
      BSIT: "bg-red-100 text-red-800",
      "BSBA-FM": "bg-yellow-100 text-yellow-800",
      "BSBA-MM": "bg-yellow-100 text-yellow-800",
      BSED: "bg-blue-100 text-blue-800",
      BEED: "bg-blue-100 text-blue-800",
      "GEN ED": "bg-green-100 text-green-800",
    };
    return colors[programName] || "bg-gray-100 text-gray-800";
  };

  // Get unique programs for filter
  const programOptions = [
    ...new Set(ebooks.map((ebook) => ebook.program_name)),
  ];

  useEffect(() => {
    // Process eBooks with program names and uploader names
    const processedEbooks = EBOOKS_DATA.map((ebook) => {
      const program = PROGRAMS.find((p) => p.id === ebook.program_id);
      return {
        ...ebook,
        program_name: program ? program.name : "Unknown",
        uploader_name: ebook.uploader_name || "Unknown",
      };
    });

    setEbooks(processedEbooks);
    setFilteredEbooks(processedEbooks);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = [...ebooks];

    if (searchTerm) {
      filtered = filtered.filter((ebook) =>
        ebook.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (programFilter) {
      filtered = filtered.filter(
        (ebook) => ebook.program_name === programFilter,
      );
    }

    setFilteredEbooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, programFilter, ebooks]);

  const clearFilters = () => {
    setSearchTerm("");
    setProgramFilter("");
  };

  const activeFilterCount = [searchTerm, programFilter].filter(Boolean).length;

  // Format functions to pass to EbookCard
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDownloads = (downloads) => {
    if (!downloads) return "0";
    if (downloads >= 1000) {
      return (downloads / 1000).toFixed(1) + "k";
    }
    return downloads.toString();
  };

  const handleDownload = (ebookId, title, fileName) => {
    // Implement download logic here
    toast.success(`Downloading: ${title}`);
    // You can add actual download logic here
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My eBooks</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize your uploaded eBooks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload New eBook
          </button>
        </div>
      </div>

      {/* Search Bar with Program Filter Dropdown */}
      <div className="mb-6">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Program Filter Select */}
          <div className="w-48">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Programs</option>
              {programOptions.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters and Results Count */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {programFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Program: {programFilter}
                  <button
                    onClick={() => setProgramFilter("")}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredEbooks.length} eBooks
        </div>
      </div>

      {/* Ebooks Grid - Using EbookCard - Displaying 3 cards */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No eBooks Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || programFilter
              ? "Try adjusting your filters"
              : "Start by uploading your first eBook"}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload eBook
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onDownload={handleDownload}
                getProgramColor={getProgramColor}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
                formatDownloads={formatDownloads}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Ebooks;
