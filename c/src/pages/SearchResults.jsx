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
import noSearchFound from "@/assets/images/noSearchFound.png";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_EBOOKS = [
  {
    id: 1,
    title: "Introduction to Information Technology",
    cover_url: null,
    downloads: 1234,
    created_at: "2024-01-15T10:00:00Z",
    program_id: "1",
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#ef4444",
    year_level: "1",
    uploader_name: "Prof. Smith",
  },
  {
    id: 2,
    title: "Financial Management Fundamentals",
    cover_url: null,
    downloads: 892,
    created_at: "2024-02-20T10:00:00Z",
    program_id: "2",
    program_acronym: "BSBA-FM",
    program_name: "Financial Management",
    program_color: "#f59e0b",
    year_level: "2",
    uploader_name: "Prof. Johnson",
  },
  {
    id: 3,
    title: "Marketing Strategies in Digital Age",
    cover_url: null,
    downloads: 756,
    created_at: "2024-01-10T10:00:00Z",
    program_id: "3",
    program_acronym: "BSBA-MM",
    program_name: "Marketing Management",
    program_color: "#f59e0b",
    year_level: "3",
    uploader_name: "Prof. Williams",
  },
  {
    id: 4,
    title: "Child and Adolescent Development",
    cover_url: null,
    downloads: 567,
    created_at: "2024-03-01T10:00:00Z",
    program_id: "4",
    program_acronym: "BEED",
    program_name: "Elementary Education",
    program_color: "#3b82f6",
    year_level: "2",
    uploader_name: "Prof. Brown",
  },
  {
    id: 5,
    title: "Teaching Methods for Secondary Education",
    cover_url: null,
    downloads: 678,
    created_at: "2024-02-25T10:00:00Z",
    program_id: "5",
    program_acronym: "BSED",
    program_name: "Secondary Education",
    program_color: "#3b82f6",
    year_level: "3",
    uploader_name: "Prof. Davis",
  },
  {
    id: 6,
    title: "Database Management Systems",
    cover_url: null,
    downloads: 2345,
    created_at: "2024-01-05T10:00:00Z",
    program_id: "1",
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#ef4444",
    year_level: "2",
    uploader_name: "Prof. Wilson",
  },
  {
    id: 7,
    title: "Web Development Fundamentals",
    cover_url: null,
    downloads: 1876,
    created_at: "2024-02-10T10:00:00Z",
    program_id: "1",
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#ef4444",
    year_level: "1",
    uploader_name: "Prof. Martinez",
  },
  {
    id: 8,
    title: "Corporate Finance",
    cover_url: null,
    downloads: 543,
    created_at: "2024-03-10T10:00:00Z",
    program_id: "2",
    program_acronym: "BSBA-FM",
    program_name: "Financial Management",
    program_color: "#f59e0b",
    year_level: "3",
    uploader_name: "Prof. Taylor",
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const getCoverUrl = (book) => {
  if (!book.cover_url) return null;
  if (book.cover_url.startsWith("http")) {
    return book.cover_url;
  }
  return book.cover_url;
};

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

// ── Book Card ─────────────────────────────────────────────────────────────────
const BookCard = ({ book, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const coverSrc = getCoverUrl(book);
  const showCover = coverSrc && !imgError;

  // Use program color from mock data or default to blue
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
          {/* Badge using program color from mock data */}
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

  // Load mock data
  useEffect(() => {
    // Simulate API loading delay
    const loadData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAllEbooks(MOCK_EBOOKS);
        setError(null);
      } catch (err) {
        console.error("Failed to load ebooks:", err);
        setError("Failed to load ebooks. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
