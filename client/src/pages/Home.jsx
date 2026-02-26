// pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Users,
  BookMarked,
  ArrowRight,
  Download,
  X,
  Filter,
  Award,
  Sparkles,
  GraduationCap,
  BookText,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import heroBg from "@/assets/images/heroBg.png";
import { ebookService } from "@/services/ebookService";

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
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

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSort, setSelectedSort] = useState("popular");

  // Real featured books (top 3 by downloads)
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
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
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCourse) params.set("course", selectedCourse);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedSort) params.set("sort", selectedSort);
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSort("popular");
  };

  // Course options for OPOL Community College
  const courses = [
    {
      value: "bsit",
      label: "Bachelor of Science in Information Technology",
      color: "red",
    },
    {
      value: "bsba-fm",
      label:
        "Bachelor of Science in Business Administration major in Financial Management",
      color: "yellow",
    },
    {
      value: "bsba-mm",
      label:
        "Bachelor of Science in Business Administration major in Marketing Management",
      color: "yellow",
    },
    { value: "beed", label: "Bachelor of Elementary Education", color: "blue" },
    { value: "bsed", label: "Bachelor of Secondary Education", color: "blue" },
  ];

  // Year levels
  const yearLevels = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];

  // Function to get badge color based on course
  const getCourseBadgeColor = (courseCode) => {
    switch (courseCode) {
      case "BSED":
        return "bg-blue-100 text-blue-600";
      case "BEED":
        return "bg-blue-100 text-blue-600";
      case "BSBA-FM":
      case "BSBA-MM":
        return "bg-yellow-100 text-yellow-600";
      case "BSIT":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-50 text-primary";
    }
  };

  // Categories with icons - Updated to "Browse by Course"
  const browseCourses = [
    {
      name: "BS Information Technology",
      count: 245,
      icon: Award,
      code: "BSIT",
      color: "green",
    },
    {
      name: "BSBA Financial Management",
      count: 98,
      icon: BookMarked,
      code: "BSBA-FM",
      color: "yellow",
    },
    {
      name: "BSBA Marketing Management",
      count: 91,
      icon: BookMarked,
      code: "BSBA-MM",
      color: "yellow",
    },
    {
      name: "B Elementary Education",
      count: 123,
      icon: GraduationCap,
      code: "BEED",
      color: "blue",
    },
    {
      name: "B Secondary Education",
      count: 87,
      icon: BookText,
      code: "BSED",
      color: "red",
    },
    {
      name: "Short Courses & Certificates",
      count: 156,
      icon: Sparkles,
      code: "SHORT",
      color: "purple",
    },
  ];

  // Stats
  const stats = [
    { label: "eBooks Available", value: "5,000+", icon: BookOpen },
    { label: "Active Students", value: "2,500+", icon: Users },
    { label: "Courses Covered", value: "15+", icon: GraduationCap },
    { label: "Downloads", value: "50K+", icon: Download },
  ];

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
              Access thousands of eBooks tailored for your course and year level
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
                  placeholder="Search by title, author, or course..."
                  className="flex-1 px-3 py-0 h-[56px] focus:outline-none focus:ring-0 focus:border-transparent border-0 ring-0 outline-none text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-5 h-[56px] flex items-center gap-2 transition-colors focus:outline-none focus:ring-0 ${
                    showFilters || selectedCourse !== "" || selectedYear !== ""
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Filter</span>
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-8 h-[56px] font-medium hover:bg-primaryDark transition-colors text-sm focus:outline-none focus:ring-0"
                >
                  Search
                </button>
              </div>

              {/* Filter Dropdown - Compact Single Row Design */}
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
                      {/* Course Filter */}
                      <div className="relative min-w-[180px]">
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="">All Courses</option>
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
                          <option value="rating">Highest Rated</option>
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

                    {/* Active Filters Display - Moved below the row */}
                    {(selectedCourse || selectedYear) && (
                      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        {selectedCourse && (
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                            {
                              courses.find((c) => c.value === selectedCourse)
                                ?.label
                            }
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
              to="/search?sort=popular"
              className="text-primary hover:text-primaryDark flex items-center gap-1 text-sm font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredBooks.map((book, idx) => {
                const API_URL =
                  import.meta.env.VITE_API_URL?.replace("/api", "") ||
                  "http://localhost:5000";
                const coverSrc = book.cover_url
                  ? `${API_URL}${book.cover_url}`
                  : null;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/ebook/${book.id}`)}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                          <BookOpen className="w-16 h-16 text-slate-300" />
                          <p className="text-xs text-slate-400 text-center line-clamp-3 font-medium">
                            {book.title}
                          </p>
                        </div>
                      )}
                      {/* Rank badge */}
                      <div className="absolute top-2 right-2 text-2xl drop-shadow-md">
                        {medals[idx]}
                      </div>
                      {book.year_level && (
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          Year {book.year_level}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                        {book.title}
                      </h3>
                      {book.uploader_name && (
                        <p className="text-xs text-gray-500 mb-3 truncate">
                          by {book.uploader_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getCourseBadgeColor(book.course)}`}
                        >
                          {book.course}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                          <Download className="w-3.5 h-3.5 text-blue-500" />
                          <span>
                            {formatDownloads(book.downloads)} downloads
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Course Section - Updated */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Browse by Course
            </h2>
            <p className="text-sm text-gray-600">
              Find books specific to your program of study
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {browseCourses.map((course, index) => {
              const Icon = course.icon;
              const colorClasses = {
                green: "hover:bg-green-600",
                yellow: "hover:bg-yellow-600",
                blue: "hover:bg-blue-600",
                red: "hover:bg-red-600",
                purple: "hover:bg-purple-600",
              };

              return (
                <Link
                  key={index}
                  to={`/course/${course.code.toLowerCase()}`}
                  className={`bg-gray-50 hover:bg-primary group p-5 rounded-lg text-left transition-all duration-300 flex items-center gap-4`}
                >
                  <div
                    className={`p-3 rounded-lg bg-white/80 group-hover:bg-white/20 transition-colors`}
                  >
                    <Icon
                      className={`w-6 h-6 text-primary group-hover:text-white transition-colors`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                      {course.count} books available
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Optional, you can keep or remove */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 bg-primary/10 rounded-full mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Start Your Learning Journey
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Access course-specific materials and enhance your studies
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/browse"
              className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Library
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
