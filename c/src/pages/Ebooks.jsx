// src/pages/Ebooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Upload,
  GraduationCap,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    id: 1,
    name: "Bachelor of Science in Information Technology",
    acronym: "BSIT",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Bachelor of Science in Computer Science",
    acronym: "BSCS",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Bachelor of Science in Computer Engineering",
    acronym: "BSCpE",
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "Bachelor of Science in Electronics Engineering",
    acronym: "BSECE",
    color: "#8b5cf6",
  },
  {
    id: 5,
    name: "Bachelor of Science in Electrical Engineering",
    acronym: "BSEE",
    color: "#ef4444",
  },
  {
    id: 6,
    name: "Bachelor of Science in Mechanical Engineering",
    acronym: "BSME",
    color: "#06b6d4",
  },
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
    year_level: 1,
    created_at: "2024-01-10T08:00:00Z",
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
    year_level: 2,
    created_at: "2024-01-15T08:00:00Z",
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
    year_level: 2,
    created_at: "2024-02-01T08:00:00Z",
  },
  {
    id: "4",
    program_id: 2,
    title: "Discrete Mathematics",
    file_name: "discrete-math.pdf",
    file_size: 5242880,
    file_url: "#",
    cover_url: null,
    downloads: 198,
    views: 670,
    year_level: 1,
    created_at: "2024-01-20T08:00:00Z",
  },
  {
    id: "5",
    program_id: 2,
    title: "Operating Systems Concepts",
    file_name: "os-concepts.pdf",
    file_size: 6291456,
    file_url: "#",
    cover_url: null,
    downloads: 321,
    views: 980,
    year_level: 3,
    created_at: "2024-02-10T08:00:00Z",
  },
  {
    id: "6",
    program_id: 3,
    title: "Digital Logic Design",
    file_name: "digital-logic.pdf",
    file_size: 3670016,
    file_url: "#",
    cover_url: null,
    downloads: 156,
    views: 520,
    year_level: 1,
    created_at: "2024-03-01T08:00:00Z",
  },
  {
    id: "7",
    program_id: 3,
    title: "Microprocessors and Microcontrollers",
    file_name: "microprocessors.pdf",
    file_size: 4718592,
    file_url: "#",
    cover_url: null,
    downloads: 234,
    views: 810,
    year_level: 3,
    created_at: "2024-03-15T08:00:00Z",
  },
  {
    id: "8",
    program_id: 1,
    title: "Web Development Fundamentals",
    file_name: "web-dev.pdf",
    file_size: 2621440,
    file_url: "#",
    cover_url: null,
    downloads: 567,
    views: 2100,
    year_level: 2,
    created_at: "2024-04-01T08:00:00Z",
  },
  {
    id: "9",
    program_id: 2,
    title: "Artificial Intelligence",
    file_name: "ai-fundamentals.pdf",
    file_size: 7340032,
    file_url: "#",
    cover_url: null,
    downloads: 445,
    views: 1680,
    year_level: 4,
    created_at: "2024-04-15T08:00:00Z",
  },
  {
    id: "10",
    program_id: 4,
    title: "Electronic Circuits Analysis",
    file_name: "circuits.pdf",
    file_size: 5767168,
    file_url: "#",
    cover_url: null,
    downloads: 123,
    views: 430,
    year_level: 2,
    created_at: "2024-05-01T08:00:00Z",
  },
  {
    id: "11",
    program_id: 1,
    title: "Software Engineering",
    file_name: "software-eng.pdf",
    file_size: 3932160,
    file_url: "#",
    cover_url: null,
    downloads: 378,
    views: 1350,
    year_level: 3,
    created_at: "2024-05-10T08:00:00Z",
  },
  {
    id: "12",
    program_id: 2,
    title: "Machine Learning Basics",
    file_name: "ml-basics.pdf",
    file_size: 8388608,
    file_url: "#",
    cover_url: null,
    downloads: 512,
    views: 1920,
    year_level: 4,
    created_at: "2024-05-20T08:00:00Z",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const yearLevels = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

const Ebooks = () => {
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [imageStates, setImageStates] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Simulate async fetch
    const timer = setTimeout(() => {
      setEbooks(EBOOKS_DATA);
      setFilteredEbooks(EBOOKS_DATA);
      const initialImageStates = {};
      EBOOKS_DATA.forEach((e) => {
        initialImageStates[e.id] = { loading: true, error: false };
      });
      setImageStates(initialImageStates);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterEbooks();
  }, [searchTerm, selectedProgram, selectedYear, ebooks]);

  const filterEbooks = () => {
    let filtered = [...ebooks];
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedProgram) {
      filtered = filtered.filter(
        (e) => String(e.program_id) === String(selectedProgram),
      );
    }
    if (selectedYear) {
      filtered = filtered.filter(
        (e) => String(e.year_level) === String(selectedYear),
      );
    }
    setFilteredEbooks(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedProgram("");
    setSelectedYear("");
  };

  const activeFilterCount = [searchTerm, selectedProgram, selectedYear].filter(
    Boolean,
  ).length;

  const getCoverUrl = (ebook) => {
    if (!ebook.cover_url) return null;
    if (ebook.cover_url.startsWith("http")) return ebook.cover_url;
    return null;
  };

  const handleImageLoad = (ebookId) => {
    setImageStates((prev) => ({
      ...prev,
      [ebookId]: { ...prev[ebookId], loading: false, error: false },
    }));
  };

  const handleImageError = (ebookId) => {
    setImageStates((prev) => ({
      ...prev,
      [ebookId]: { ...prev[ebookId], loading: false, error: true },
    }));
  };

  const truncateFileName = (name, maxLength = 20) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - 3 - extension.length,
    );
    return `${truncatedName}...${extension}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

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

  const getProgramLabel = (programId) => {
    if (!programId) return "N/A";
    const prog = PROGRAMS.find((p) => String(p.id) === String(programId));
    return prog ? prog.acronym || prog.name : "Unknown";
  };

  const getProgramColor = (programId) => {
    if (!programId) return "#3b82f6";
    const prog = PROGRAMS.find((p) => String(p.id) === String(programId));
    return prog?.color || "#3b82f6";
  };

  const handleEbookClick = (ebook) => {
    navigate(`/ebook-record/${ebook.id}`, { state: { ebook } });
  };

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
        <button
          onClick={() => navigate("/upload")}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload New eBook
        </button>
      </div>

      {/* Compact Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-sm border rounded-lg flex items-center gap-1.5 transition-colors relative ${
              showFilters || activeFilterCount > 0
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <GraduationCap className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Programs</option>
                  {PROGRAMS.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.acronym} – {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Years</option>
                  {yearLevels.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredEbooks.length} eBooks
        </div>
      </div>

      {/* Ebooks Grid */}
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
            {searchTerm || selectedProgram || selectedYear
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((ebook) => {
              const coverUrl = getCoverUrl(ebook);
              const imageState = imageStates[ebook.id] || {
                loading: true,
                error: false,
              };

              return (
                <div
                  key={ebook.id}
                  onClick={() => handleEbookClick(ebook)}
                  className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {imageState.loading && coverUrl && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {coverUrl && !imageState.error ? (
                      <img
                        src={coverUrl}
                        alt={ebook.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          imageState.loading ? "opacity-0" : "opacity-100"
                        }`}
                        onLoad={() => handleImageLoad(ebook.id)}
                        onError={() => handleImageError(ebook.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Program Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full shadow-sm"
                        style={{
                          backgroundColor: getProgramColor(ebook.program_id),
                          color: "#fff",
                        }}
                      >
                        {getProgramLabel(ebook.program_id)}
                      </span>
                    </div>

                    {/* Year Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-medium px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                        Year {ebook.year_level}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                      {ebook.title}
                    </h3>
                    <p
                      className="text-xs text-gray-500 mb-2 truncate"
                      title={ebook.file_name}
                    >
                      {truncateFileName(ebook.file_name)}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(ebook.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Download className="w-3 h-3" />
                        <span>{ebook.downloads || 0}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {formatFileSize(ebook.file_size)}
                    </div>
                  </div>
                </div>
              );
            })}
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
