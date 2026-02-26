// src/pages/SearchResults.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  Download,
  BookOpen,
  Filter,
  X,
  ChevronDown,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import noSearchFound from "@/assets/images/noSearchFound.png";

// ── helpers ──────────────────────────────────────────────────────────────────

const getCourseBadgeColor = (courseCode) => {
  switch ((courseCode || "").toUpperCase()) {
    case "BSED":
    case "BEED":
      return "bg-blue-100 text-blue-700";
    case "BSBA-FM":
    case "BSBA-MM":
      return "bg-yellow-100 text-yellow-700";
    case "BSIT":
      return "bg-red-100 text-red-700";
    default:
      return "bg-indigo-50 text-indigo-700";
  }
};

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

// ── courses & years ───────────────────────────────────────────────────────────
const COURSES = [
  { value: "BSIT", label: "BS Information Technology" },
  { value: "BSBA-FM", label: "BSBA Financial Management" },
  { value: "BSBA-MM", label: "BSBA Marketing Management" },
  { value: "BEED", label: "B Elementary Education" },
  { value: "BSED", label: "B Secondary Education" },
];

const YEAR_LEVELS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Downloaded" },
  { value: "recent", label: "Recently Added" },
  { value: "title", label: "Title A–Z" },
];

// ── Book Card ─────────────────────────────────────────────────────────────────
const BookCard = ({ book, onClick }) => {
  const API_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  const coverSrc = book.cover_url ? `${API_URL}${book.cover_url}` : null;

  return (
    <div
      onClick={() => onClick(book.id)}
      className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              e.target.parentNode.classList.add("no-cover");
            }}
          />
        ) : null}

        {/* Fallback when no cover */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 ${coverSrc ? "hidden" : "flex"}`}
        >
          <BookOpen className="w-10 h-10 text-slate-300" />
          <p className="text-xs text-slate-400 text-center line-clamp-3 font-medium">
            {book.title}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">
          {book.title}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCourseBadgeColor(book.course)}`}
          >
            {book.course}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="w-3 h-3" />
            <span className="text-xs">{formatDownloads(book.downloads)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Derive state from URL params
  const queryParam = searchParams.get("q") || "";
  const courseParam = searchParams.get("course") || "";
  const yearParam = searchParams.get("year") || "";
  const sortParam = searchParams.get("sort") || "popular";

  // Local search bar state
  const [inputValue, setInputValue] = useState(queryParam);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(courseParam);
  const [selectedYear, setSelectedYear] = useState(yearParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);

  // Data state
  const [allEbooks, setAllEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync local state when URL changes
  useEffect(() => {
    setInputValue(queryParam);
    setSelectedCourse(courseParam);
    setSelectedYear(yearParam);
    setSelectedSort(sortParam);
  }, [queryParam, courseParam, yearParam, sortParam]);

  // Fetch all ebooks once
  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const data = await ebookService.getEbooks();
        setAllEbooks(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Failed to fetch ebooks:", err);
        setError("Failed to load ebooks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

  // Client-side filter + sort
  const results = React.useMemo(() => {
    let filtered = [...allEbooks];

    if (queryParam.trim()) {
      const q = queryParam.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.uploader_name?.toLowerCase().includes(q) ||
          b.course?.toLowerCase().includes(q),
      );
    }

    if (courseParam) {
      filtered = filtered.filter(
        (b) => b.course?.toUpperCase() === courseParam.toUpperCase(),
      );
    }

    if (yearParam) {
      filtered = filtered.filter((b) => String(b.year_level) === yearParam);
    }

    switch (sortParam) {
      case "popular":
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case "recent":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        break;
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        break;
    }

    return filtered;
  }, [allEbooks, queryParam, courseParam, yearParam, sortParam]);

  // Update URL
  const applySearch = useCallback(() => {
    const params = {};
    if (inputValue.trim()) params.q = inputValue.trim();
    if (selectedCourse) params.course = selectedCourse;
    if (selectedYear) params.year = selectedYear;
    if (selectedSort) params.sort = selectedSort;
    setSearchParams(params, { replace: true });
    setShowFilters(false);
  }, [inputValue, selectedCourse, selectedYear, selectedSort, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applySearch();
  };

  const clearFilters = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSort("popular");
    setSearchParams(
      inputValue.trim()
        ? { q: inputValue.trim(), sort: "popular" }
        : { sort: "popular" },
      { replace: true },
    );
  };

  const hasActiveFilters = courseParam || yearParam || sortParam !== "popular";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      {/* Search Bar Strip */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-blue-300 focus-within:bg-white transition-all">
              <div className="pl-5">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search by title, author, or course..."
                className="flex-1 px-3 py-0 h-[48px] focus:outline-none focus:ring-0 border-0 bg-transparent text-gray-700 text-sm"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue("")}
                  className="px-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 h-[48px] flex items-center gap-1.5 transition-colors focus:outline-none text-sm ${
                  showFilters || hasActiveFilters
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                )}
              </button>
              <button
                type="submit"
                className="bg-blue-700 text-white px-6 h-[48px] font-medium hover:bg-blue-800 transition-colors text-sm focus:outline-none"
              >
                Search
              </button>
            </div>

            {/* Filter dropdown - same as before */}
            {showFilters && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    Filter Books
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                  {/* Course */}
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Course
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full appearance-none px-3 py-2 pr-7 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                      >
                        <option value="">All Courses</option>
                        {COURSES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Year */}
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Year Level
                    </label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full appearance-none px-3 py-2 pr-7 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                      >
                        <option value="">All Years</option>
                        {YEAR_LEVELS.map((y) => (
                          <option key={y.value} value={y.value}>
                            {y.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="w-full appearance-none px-3 py-2 pr-7 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                      >
                        {SORT_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={applySearch}
                      className="px-4 py-2 text-xs bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors focus:outline-none"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    {courseParam && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                        {COURSES.find((c) => c.value === courseParam)?.label ||
                          courseParam}
                        <button
                          onClick={() => {
                            setSelectedCourse("");
                            setSearchParams(
                              (p) => {
                                const np = new URLSearchParams(p);
                                np.delete("course");
                                return np;
                              },
                              { replace: true },
                            );
                          }}
                          className="hover:bg-blue-100 rounded-full p-0.5 focus:outline-none"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {yearParam && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                        {YEAR_LEVELS.find((y) => y.value === yearParam)
                          ?.label || `Year ${yearParam}`}
                        <button
                          onClick={() => {
                            setSelectedYear("");
                            setSearchParams(
                              (p) => {
                                const np = new URLSearchParams(p);
                                np.delete("year");
                                return np;
                              },
                              { replace: true },
                            );
                          }}
                          className="hover:bg-blue-100 rounded-full p-0.5 focus:outline-none"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results Area */}
      <main className="container mx-auto px-4 py-6">
        {/* Back + heading */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {queryParam
                ? `Results for "${queryParam}"`
                : hasActiveFilters
                  ? "Filtered Results"
                  : "All eBooks"}
            </h1>
            {!loading && (
              <p className="text-xs text-gray-500 mt-0.5">
                {results.length} {results.length === 1 ? "book" : "books"} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-4/5" />
                  <div className="h-2 bg-gray-100 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-blue-600 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && !error && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <img
              src={noSearchFound}
              alt="No results found"
              className="w-48 h-auto opacity-90"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                No eBooks Found
              </h3>
              <p className="text-xs text-gray-500 max-w-xs">
                {queryParam
                  ? `We couldn't find any books matching "${queryParam}". Try different keywords or clear the filters.`
                  : "No books match the current filters. Try adjusting your search."}
              </p>
              <button
                onClick={() => {
                  setInputValue("");
                  clearFilters();
                  setSearchParams({}, { replace: true });
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {results.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={(id) => navigate(`/ebook/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
