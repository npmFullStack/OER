// src/pages/EbooksByProgram.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Download,
  ArrowLeft,
  GraduationCap,
  Calendar,
  User,
  Filter,
  Search,
  Grid3x3,
  List,
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
        <div className="w-20 h-28 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
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
        <div className="flex-1 p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
            {book.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatDownloads(book.downloads)}
            </span>
            {book.year_level && <span>Year {book.year_level}</span>}
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-2">
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

const EbooksByProgram = () => {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programLoading, setProgramLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProgramDetails();
    fetchProgramEbooks();
  }, [programId]);

  useEffect(() => {
    applyFilters();
  }, [ebooks, searchQuery, selectedYear, sortBy]);

  const fetchProgramDetails = async () => {
    try {
      setProgramLoading(true);
      const response = await programService.getById(programId);
      if (response.success && response.data) {
        setProgram(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch program:", error);
      toast.error("Failed to load program details");
    } finally {
      setProgramLoading(false);
    }
  };

  const fetchProgramEbooks = async () => {
    try {
      setLoading(true);
      const data = await ebookService.getEbooksByProgram(programId);
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

  const applyFilters = () => {
    let filtered = [...ebooks];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(query) ||
          book.uploader_name?.toLowerCase().includes(query),
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
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "most-downloaded":
          return (b.downloads || 0) - (a.downloads || 0);
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    setFilteredEbooks(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedYear("");
    setSortBy("newest");
  };

  const activeFilterCount = [searchQuery, selectedYear].filter(Boolean).length;

  // Stats
  const totalDownloads = ebooks.reduce(
    (sum, book) => sum + (book.downloads || 0),
    0,
  );
  const uniqueYears = [
    ...new Set(ebooks.map((b) => b.year_level).filter(Boolean)),
  ].sort();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      {/* Program Header */}
      <section
        className="relative py-12 border-b border-gray-200"
        style={{
          backgroundColor: program?.color || "#3b82f6",
          backgroundImage: `linear-gradient(135deg, ${program?.color || "#3b82f6"} 0%, ${adjustColor(program?.color || "#3b82f6", -20)} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {programLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-48 mb-3" />
              <div className="h-4 bg-white/20 rounded w-96" />
            </div>
          ) : program ? (
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {program.acronym}
                </h1>
                <p className="text-lg text-white/90 mb-4">{program.name}</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-white/80">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{ebooks.length} eBooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDownloads(totalDownloads)} total downloads
                    </span>
                  </div>
                  {uniqueYears.length > 0 && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Years:{" "}
                        {uniqueYears
                          .sort()
                          .map((y) => `${y}`)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white">
              <h1 className="text-2xl font-bold">Program Not Found</h1>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search within this program..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                {/* Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-[120px]"
                >
                  <option value="">All Years</option>
                  {yearOptions.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-downloaded">Most Downloaded</option>
                  <option value="title">Title A-Z</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-primary text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
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

            {/* Active Filters */}
            {(searchQuery || selectedYear) && (
              <div className="flex flex-wrap items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        ×
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
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredEbooks.length} of {ebooks.length} eBooks
            </p>
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
                {searchQuery || selectedYear
                  ? "Try adjusting your filters"
                  : "No eBooks have been uploaded for this program yet"}
              </p>
              {(searchQuery || selectedYear) && (
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
                  {filteredEbooks.map((book) => (
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
                  {filteredEbooks.map((book) => (
                    <EbookCard
                      key={book.id}
                      book={book}
                      viewMode="list"
                      onClick={() => navigate(`/ebook/${book.id}`)}
                    />
                  ))}
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

// Helper function to adjust color brightness
const adjustColor = (hex, percent) => {
  try {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  } catch {
    return hex;
  }
};

export default EbooksByProgram;
