// src/pages/AllEbooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Filter,
  X,
  Download,
  ArrowLeft,
  Grid3x3,
  List,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ebookService } from "@/services/ebookService";
import programService from "@/services/programService";
import toast from "react-hot-toast";

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

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
  { value: "title-asc", label: "Title A-Z" },
  { value: "title-desc", label: "Title Z-A" },
];

const EbookCard = ({ book, viewMode = "grid", onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const getCoverUrl = () => {
    if (!book.cover_url) return null;
    if (book.cover_url.startsWith("http")) {
      return book.cover_url;
    }
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${book.cover_url}`;
  };

  const coverUrl = getCoverUrl();
  const showCover = coverUrl && !imgError;
  const programColor = book.program_color || "#3b82f6";

  if (viewMode === "list") {
    return (
      <div
        onClick={onClick}
        className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer flex overflow-hidden"
      >
        {/* Cover thumbnail */}
        <div className="w-24 h-32 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          {imgLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {showCover ? (
            <img
              src={coverUrl}
              alt={book.title}
              className={`w-full h-full object-cover ${
                imgLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: programColor }}
              >
                {book.program_acronym || "N/A"}
              </span>
              {book.year_level && (
                <span className="text-[10px] text-gray-500">
                  {yearOptions.find((y) => y.value === String(book.year_level))
                    ?.label || `Year ${book.year_level}`}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              by {book.uploader_name || "Unknown"}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Download className="w-3 h-3 text-blue-500" />
              <span>{formatDownloads(book.downloads)}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(book.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
        style={{ height: "200px" }}
      >
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {showCover ? (
          <img
            src={coverUrl}
            alt={book.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imgLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <BookOpen className="w-12 h-12 text-slate-400" />
            <p className="text-xs text-slate-500 text-center line-clamp-3">
              {book.title}
            </p>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: programColor }}
          >
            {book.program_acronym || "N/A"}
          </span>
          {book.year_level && (
            <span className="text-[10px] text-gray-500">
              Yr {book.year_level}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate max-w-[100px]">
            {book.uploader_name || "Unknown"}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="w-3 h-3 text-blue-500" />
            <span>{formatDownloads(book.downloads)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllEbooks = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  // View and filter state
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchEbooks();
    fetchPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ebooks, searchQuery, selectedProgram, selectedYear, selectedSort]);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const data = await ebookService.getEbooks();
      const books = Array.isArray(data) ? data : data.data || [];
      setEbooks(books);
      setFilteredEbooks(books);
    } catch (error) {
      console.error("Failed to fetch ebooks:", error);
      toast.error("Failed to load ebooks");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await programService.getAll();
      if (response.success && response.data) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...ebooks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(query) ||
          book.uploader_name?.toLowerCase().includes(query) ||
          book.program_name?.toLowerCase().includes(query) ||
          book.program_acronym?.toLowerCase().includes(query),
      );
    }

    // Apply program filter
    if (selectedProgram) {
      filtered = filtered.filter(
        (book) => String(book.program_id) === selectedProgram,
      );
    }

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter(
        (book) => String(book.year_level) === selectedYear,
      );
    }

    // Apply sorting
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedProgram("");
    setSelectedYear("");
    setSelectedSort("newest");
  };

  const activeFilterCount = [searchQuery, selectedProgram, selectedYear].filter(
    Boolean,
  ).length;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      {/* Header Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All eBooks</h1>
              <p className="text-sm text-gray-600">
                Browse our complete collection of {filteredEbooks.length} eBooks
              </p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or program..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex gap-2">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
                  showFilters || activeFilterCount > 0
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Filter eBooks</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Program Filter */}
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
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.acronym} - {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Level Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Year Level
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Sort By
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters and Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedProgram && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      Program:{" "}
                      {
                        programs.find((p) => String(p.id) === selectedProgram)
                          ?.acronym
                      }
                      <button
                        onClick={() => setSelectedProgram("")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedYear && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      Year:{" "}
                      {yearOptions.find((y) => y.value === selectedYear)?.label}
                      <button
                        onClick={() => setSelectedYear("")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredEbooks.length)} of{" "}
              {filteredEbooks.length} eBooks
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="border-none bg-transparent font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
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
          )}

          {/* Empty State */}
          {!loading && filteredEbooks.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No eBooks Found
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || selectedProgram || selectedYear
                  ? "Try adjusting your filters or search query"
                  : "No eBooks have been uploaded yet"}
              </p>
              {(searchQuery || selectedProgram || selectedYear) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* eBooks Grid/List */}
          {!loading && filteredEbooks.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentItems.map((book) => (
                    <EbookCard
                      key={book.id}
                      book={book}
                      viewMode="grid"
                      onClick={() => navigate(`/ebook/${book.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentItems.map((book) => (
                    <EbookCard
                      key={book.id}
                      book={book}
                      viewMode="list"
                      onClick={() => navigate(`/ebook/${book.id}`)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg ${
                        currentPage === i + 1
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllEbooks;
