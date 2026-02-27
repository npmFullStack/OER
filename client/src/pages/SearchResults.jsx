// src/pages/SearchResults.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import noSearchFound from "@/assets/images/noSearchFound.png";

// ── helpers ──────────────────────────────────────────────────────────────────
const getCoverUrl = (book) => {
  if (!book.cover_url) return null;

  // If it's already a full URL, use it
  if (book.cover_url.startsWith("http")) {
    return book.cover_url;
  }

  // Otherwise, construct from base URL
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  return `${baseUrl}${book.cover_url}`;
};

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
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const coverSrc = getCoverUrl(book);
  const showCover = coverSrc && !imgError;

  // Use program color from database or default to blue
  const programColor = book.program_color || "#3b82f6";

  return (
    <div
      onClick={() => onClick(book.id)}
      className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {showCover ? (
          <img
            src={coverSrc}
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
        ) : null}

        {/* Fallback when no cover */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 ${
            showCover ? "hidden" : "flex"
          }`}
        >
          <BookOpen className="w-10 h-10 text-slate-300" />
          <p className="text-xs text-slate-400 text-center line-clamp-3 font-medium">
            {book.title}
          </p>
          {!imgLoading && (
            <p className="text-[10px] text-slate-400 mt-1">Cover unavailable</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">
          {book.title}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Updated badge to use program color from database */}
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: programColor }}
          >
            {book.program_acronym || book.course || "N/A"}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="w-3 h-3 text-blue-500" />
            <span className="text-xs">{formatDownloads(book.downloads)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SearchResults = ({
  initialSearchQuery = "",
  initialCourse = "",
  initialYear = "",
  initialSort = "popular",
  onClose,
}) => {
  const navigate = useNavigate();

  // Local search bar state
  const [inputValue, setInputValue] = useState(initialSearchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Data state
  const [allEbooks, setAllEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    if (initialSearchQuery.trim()) {
      const q = initialSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.uploader_name?.toLowerCase().includes(q) ||
          b.program_name?.toLowerCase().includes(q) ||
          b.program_acronym?.toLowerCase().includes(q),
      );
    }

    if (initialCourse) {
      filtered = filtered.filter((b) => String(b.program_id) === initialCourse);
    }

    if (initialYear) {
      filtered = filtered.filter((b) => String(b.year_level) === initialYear);
    }

    switch (initialSort) {
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
  }, [allEbooks, initialSearchQuery, initialCourse, initialYear, initialSort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Update the URL with search params and reload results
    const params = new URLSearchParams();
    if (inputValue.trim()) params.set("q", inputValue.trim());
    if (selectedCourse) params.set("course", selectedCourse);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedSort) params.set("sort", selectedSort);

    // Navigate to search page with new params
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSort("popular");
    setInputValue("");

    // Navigate to search page without filters
    navigate("/search");
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  const hasActiveFilters =
    initialCourse || initialYear || initialSort !== "popular";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Results Area */}
      <main className="container mx-auto px-4 py-6">
        {/* Back + heading */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {initialSearchQuery
                ? `Results for "${initialSearchQuery}"`
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
                {initialSearchQuery
                  ? `We couldn't find any books matching "${initialSearchQuery}". Try different keywords or clear the filters.`
                  : "No books match the current filters. Try adjusting your search."}
              </p>
              <button
                onClick={clearFilters}
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
    </div>
  );
};

export default SearchResults;
