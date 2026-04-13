// src/pages/Ebooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  AlertCircle,
  Upload,
  GraduationCap,
  X,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import programService from "@/services/programService";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Ebooks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Track image loading states for each ebook
  const [imageStates, setImageStates] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Year levels
  const yearLevels = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];

  useEffect(() => {
    fetchPrograms();
    fetchEbooks();
  }, []);

  useEffect(() => {
    filterEbooks();
  }, [searchTerm, selectedProgram, selectedYear, ebooks]);

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await programService.getAll();
      if (response.success) {
        setPrograms(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = await ebookService.getMyEbooks();
      console.log("Ebooks response:", response);

      if (response && response.success) {
        setEbooks(response.data || []);
        setFilteredEbooks(response.data || []);

        // Initialize image states for all ebooks
        const initialImageStates = {};
        response.data.forEach((ebook) => {
          initialImageStates[ebook.id] = {
            loading: true,
            error: false,
          };
        });
        setImageStates(initialImageStates);
      } else {
        toast.error(response?.message || "Failed to fetch ebooks");
      }
    } catch (error) {
      console.error("Fetch ebooks error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 404) {
        toast.error(
          "eBooks endpoint not found. Please check server configuration.",
        );
      } else if (error.response?.status === 401) {
        toast.error("Please login to view your eBooks");
      } else {
        toast.error("Error loading ebooks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterEbooks = () => {
    let filtered = [...ebooks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((ebook) =>
        ebook.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Program filter
    if (selectedProgram) {
      filtered = filtered.filter(
        (ebook) => String(ebook.program_id) === String(selectedProgram),
      );
    }

    // Year level filter
    if (selectedYear) {
      filtered = filtered.filter(
        (ebook) => String(ebook.year_level) === String(selectedYear),
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
    if (ebook.cover_url.startsWith("http")) {
      return ebook.cover_url;
    }
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://192.168.254.106:5000";
    return `${baseUrl}${ebook.cover_url}`;
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

  // Pagination
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
    const program = programs.find((p) => String(p.id) === String(programId));
    return program ? program.acronym || program.name : "Unknown";
  };

  const getProgramColor = (programId) => {
    if (!programId) return "#3b82f6";
    const program = programs.find((p) => String(p.id) === String(programId));
    return program?.color || "#3b82f6";
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
          {/* Search input - smaller */}
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

          {/* Filter Toggle Button - smaller */}
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

          {/* Clear Filters Button - smaller, only shown when filters active */}
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

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Program filter */}
              <div className="relative">
                <GraduationCap className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  disabled={loadingPrograms}
                >
                  <option value="">All Programs</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.acronym} – {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year filter */}
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

        {/* Results count */}
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
          {/* Grid View with Images */}
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
                    {imageState.loading && (
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
                  // Show pages around current page
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
