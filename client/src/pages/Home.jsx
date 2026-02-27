// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  ArrowRight,
  Download,
  X,
  Filter,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SearchResults from "@/pages/SearchResults"; // Import SearchResults
import heroBg from "@/assets/images/heroBg.png";
import { ebookService } from "@/services/ebookService";
import programService from "@/services/programService";

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const formatNumber = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const FeaturedBookCard = ({ book, onClick }) => {
  const [imgError, setImgError] = React.useState(false);
  const [imgLoading, setImgLoading] = React.useState(true);

  // Construct the full URL if needed
  const getCoverUrl = () => {
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

  const coverUrl = getCoverUrl();
  const showCover = coverUrl && !imgError;

  // Use program color from database or default to blue
  const programColor = book.program_color || "#3b82f6";

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer flex-shrink-0"
      style={{ width: "200px" }}
    >
      {/* Cover image area */}
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
        style={{ height: "280px" }}
      >
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
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
            onError={(e) => {
              console.error("Image failed to load:", coverUrl);
              setImgError(true);
              setImgLoading(false);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <BookOpen className="w-12 h-12 text-slate-400" />
            <p className="text-xs text-slate-500 text-center line-clamp-4 font-medium leading-tight">
              {book.title}
            </p>
            {!imgLoading && (
              <p className="text-[10px] text-slate-400 mt-1">
                Cover unavailable
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {book.title}
        </h3>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: programColor }}
          >
            {book.program_acronym || "N/A"}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Download className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium">
              {formatDownloads(book.downloads)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Convert hex color to a very light tint for card background
const hexToLightBg = (hex) => {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.08)`;
  } catch {
    return "rgba(59,130,246,0.08)";
  }
};

const ProgramCard = ({ program, onClick }) => {
  const color = program.color || "#3b82f6";
  const lightBg = hexToLightBg(color);

  return (
    <div
      onClick={onClick}
      className="group rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 flex"
      style={{ backgroundColor: lightBg }}
    >
      {/* Left color bar */}
      <div
        className="w-1 flex-shrink-0 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      {/* Card content */}
      <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
        <div style={{ color }}>
          <GraduationCap className="w-6 h-6 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm mb-0.5">
            {program.acronym}
          </h3>
          <p className="text-xs text-gray-500 truncate">{program.name}</p>
          <p
            className="text-xs mt-1 font-medium flex items-center gap-1"
            style={{ color }}
          >
            <BookOpen className="w-3 h-3" />
            {program.total_ebooks || 0} eBooks
          </p>
        </div>
        <ArrowRight
          className="w-4 h-4 flex-shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
          style={{ color }}
        />
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Real data states
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [stats, setStats] = useState({
    totalEbooks: 0,
    totalPrograms: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    fetchFeaturedBooks();
    fetchPrograms();
    fetchStats();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const data = await ebookService.getEbooks();
      const books = Array.isArray(data) ? data : data.data || [];
      const top3 = [...books]
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 3);
      setFeaturedBooks(top3);
    } catch (err) {
      console.error("Failed to load featured books:", err);
      setFeaturedBooks([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      // Use the endpoint that returns programs with ebook counts
      const response = await programService.getWithEbookCounts();
      if (response.success && response.data?.length > 0) {
        setPrograms(response.data);
      } else {
        // Fallback: fetch all programs without counts
        const fallback = await programService.getAll();
        setPrograms(fallback.success ? fallback.data || [] : []);
      }
    } catch (error) {
      console.error(
        "Error fetching programs with counts, trying fallback:",
        error,
      );
      try {
        const fallback = await programService.getAll();
        setPrograms(fallback.success ? fallback.data || [] : []);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setPrograms([]);
      }
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all ebooks to calculate stats
      const ebooksData = await ebookService.getEbooks();
      const ebooks = Array.isArray(ebooksData)
        ? ebooksData
        : ebooksData.data || [];

      // Fetch programs for count
      const programsResponse = await programService.getAll();
      const programsList = programsResponse.success
        ? programsResponse.data || []
        : [];

      // Calculate total downloads
      const totalDownloads = ebooks.reduce(
        (sum, book) => sum + (book.downloads || 0),
        0,
      );

      setStats({
        totalEbooks: ebooks.length,
        totalPrograms: programsList.length,
        totalDownloads: totalDownloads,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchResults(true);
  };

  const clearFilters = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSort("popular");
  };

  // Course options derived from fetched programs
  const courses = programs.map((p) => ({
    value: String(p.id),
    label: `${p.acronym} – ${p.name}`,
  }));

  // Year levels
  const yearLevels = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];

  // Active filter count (exclude sort since it has a default)
  const activeFilterCount = [selectedCourse, selectedYear].filter(
    Boolean,
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      {/* Hero Section - With Background Image */}
      <section
        className="relative py-20 border-b border-gray-200"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.92), rgba(8, 20, 38, 0.95)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Opol Community College
              <span className="text-blue-600 block mt-2">Digital Library</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Access thousands of eBooks tailored for your program and year
              level
            </p>

            {/* Search Bar - Clean Design */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <div className="pl-5">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or program..."
                  className="flex-1 px-3 py-0 h-[56px] focus:outline-none focus:ring-0 focus:border-transparent border-0 ring-0 outline-none text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-5 h-[56px] flex items-center gap-2 transition-colors focus:outline-none focus:ring-0 ${
                    showFilters || activeFilterCount > 0
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-8 h-[56px] font-medium hover:bg-primaryDark transition-colors text-sm focus:outline-none focus:ring-0"
                >
                  Search
                </button>
              </div>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-xs">
                        Filter Books
                      </h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Single Row Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Program Filter */}
                      <div className="relative min-w-[180px]">
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="">All Programs</option>
                          {courses.map((course) => (
                            <option key={course.value} value={course.value}>
                              {course.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-3 h-3 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Year Level Filter */}
                      <div className="relative min-w-[100px]">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="">All Years</option>
                          {yearLevels.map((year) => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-3 h-3 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Sort By Filter */}
                      <div className="relative min-w-[120px]">
                        <select
                          value={selectedSort}
                          onChange={(e) => setSelectedSort(e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="popular">Most Popular</option>
                          <option value="recent">Recently Added</option>
                          <option value="title">Title A-Z</option>
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg
                            className="w-3 h-3 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <button
                        onClick={clearFilters}
                        className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-0 whitespace-nowrap"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primaryDark transition-colors focus:outline-none focus:ring-0 whitespace-nowrap"
                      >
                        Apply Filters
                      </button>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCourse || selectedYear) && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        {selectedCourse && (
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                            {courses.find((c) => c.value === selectedCourse)
                              ?.label || selectedCourse}
                            <button
                              onClick={() => setSelectedCourse("")}
                              className="hover:bg-primary/20 rounded-full p-0.5 focus:outline-none focus:ring-0"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        )}
                        {selectedYear && (
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                            {
                              yearLevels.find((y) => y.value === selectedYear)
                                ?.label
                            }
                            <button
                              onClick={() => setSelectedYear("")}
                              className="hover:bg-primary/20 rounded-full p-0.5 focus:outline-none focus:ring-0"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Content Section - Conditional rendering */}
      {!showSearchResults ? (
        <>
          {/* Featured Books Section - Top 3 Most Downloaded */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Most Downloaded
                  </h2>
                  <p className="text-sm text-gray-600">
                    Top 3 most downloaded eBooks in the library
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="text-primary hover:text-primaryDark flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loadingFeatured ? (
                <div className="flex gap-6 justify-center">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse flex-shrink-0"
                      style={{ width: "200px" }}
                    >
                      <div
                        className="bg-gray-200"
                        style={{ height: "280px" }}
                      />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredBooks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No books uploaded yet.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-center">
                  {featuredBooks.map((book) => (
                    <FeaturedBookCard
                      key={book.id}
                      book={book}
                      onClick={() => navigate(`/ebook/${book.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Browse by Program Section */}
          <section className="py-16 bg-white border-y border-gray-200">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Browse by Program
                  </h2>
                  <p className="text-sm text-gray-600">
                    Find eBooks specific to your program of study
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="text-primary hover:text-primaryDark flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  View All eBooks <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loadingPrograms ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-lg p-4 animate-pulse"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : programs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No programs added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.slice(0, 6).map(
                    (
                      program, // Show only first 6 programs
                    ) => (
                      <ProgramCard
                        key={program.id}
                        program={program}
                        onClick={() =>
                          navigate(`/program/${program.id}/ebooks`)
                        }
                      />
                    ),
                  )}
                </div>
              )}

              {/* View All Programs Link - only show if there are more than 6 programs */}
              {programs.length > 6 && (
                <div className="text-center mt-8">
                  <Link
                    to="/browse"
                    className="inline-flex items-center gap-2 text-primary hover:text-primaryDark font-medium transition-colors"
                  >
                    Browse All Programs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
          {/* CTA Section */}
          <section className="py-12 bg-primary">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Start Your Learning Journey
              </h2>
              <p className="text-white/90 mb-4 max-w-xl mx-auto text-sm">
                Access program-specific materials and enhance your studies
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  to="/browse"
                  className="bg-white text-primary px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                >
                  Browse Library
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white px-5 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors text-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        // Show Search Results component with filters passed as props
        <SearchResults
          initialSearchQuery={searchQuery}
          initialCourse={selectedCourse}
          initialYear={selectedYear}
          initialSort={selectedSort}
          onClose={() => setShowSearchResults(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;
