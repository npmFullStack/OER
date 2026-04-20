// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Download,
  Library,
  Filter,
  X,
  MapPin,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomSelect from "@/components/Select";
import EbookCard from "@/components/EbookCard";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import heroBg from "@/assets/images/heroBg.png";

const programColors = {
  BSIT: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
  "BSBA-FM": {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
  },
  "BSBA-MM": {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
  },
  BSED: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  BEED: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  "GEN ED": {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
};

// Helper function to get program color class for badge
const getProgramColorBadge = (program) => {
  const colors = {
    BSIT: "bg-red-100 text-red-700",
    "BSBA-FM": "bg-yellow-100 text-yellow-700",
    "BSBA-MM": "bg-yellow-100 text-yellow-700",
    BSED: "bg-blue-100 text-blue-700",
    BEED: "bg-blue-100 text-blue-700",
    "GEN ED": "bg-green-100 text-green-700",
  };
  return colors[program] || "bg-gray-100 text-gray-700";
};

// Program Card Component matching Programs.jsx style
const ProgramCard = ({ program, color }) => {
  const lightBg = hexToLightBg(color);

  return (
    <div
      className="group rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 flex relative"
      style={{ backgroundColor: lightBg }}
    >
      <div
        className="w-1 flex-shrink-0 rounded-l-xl"
        style={{ backgroundColor: color }}
      />
      <Link
        to={`/program/${program.id || program.name.toLowerCase().replace(" ", "-")}/resources`}
        className="flex items-center gap-4 p-4 flex-1 min-w-0"
      >
        <div style={{ color }}>
          <GraduationCap className="w-6 h-6 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm mb-0.5">
            {program.acronym || program.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{program.name}</p>
          <div className="mt-1 flex items-center gap-3">
            <p
              className="text-xs font-medium flex items-center gap-1"
              style={{ color }}
            >
              <BookOpen className="w-3 h-3" />
              {program.total_books || 0} Books
            </p>
            <p
              className="text-xs font-medium flex items-center gap-1"
              style={{ color }}
            >
              <BookOpen className="w-3 h-3" />
              {program.total_ebooks || 0} eBooks
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

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

// Shelf location color mapping - updated to use bg-blue-600 with white text
const getShelfLocationColor = (location) => {
  return "bg-blue-600 text-white";
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);
  const navigate = useNavigate();

  // Programs data matching Programs.jsx structure
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: "Bachelor of Science in Information Technology",
      acronym: "BSIT",
      color: "#dc2626",
      total_books: 45,
      total_ebooks: 32,
    },
    {
      id: 2,
      name: "Bachelor of Science in Business Administration - Financial Management",
      acronym: "BSBA-FM",
      color: "#eab308",
      total_books: 38,
      total_ebooks: 28,
    },
    {
      id: 3,
      name: "Bachelor of Science in Business Administration - Marketing Management",
      acronym: "BSBA-MM",
      color: "#eab308",
      total_books: 35,
      total_ebooks: 25,
    },
    {
      id: 4,
      name: "Bachelor of Secondary Education",
      acronym: "BSED",
      color: "#3b82f6",
      total_books: 52,
      total_ebooks: 41,
    },
    {
      id: 5,
      name: "Bachelor of Elementary Education",
      acronym: "BEED",
      color: "#3b82f6",
      total_books: 48,
      total_ebooks: 36,
    },
    {
      id: 6,
      name: "General Education",
      acronym: "GEN ED",
      color: "#10b981",
      total_books: 65,
      total_ebooks: 58,
    },
  ]);

  // Popular Books data - books only (no images, no availability status)
  const [popularBooks, setPopularBooks] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      author: "John Smith, Jane Doe",
      call_number: "CS 101 .S65 2024",
      program: "BSIT",
      shelf_location: "Aisle 1 - Left",
      is_available: true,
    },
    {
      id: 2,
      title: "Financial Management Principles",
      author: "Robert Kiyosaki",
      call_number: "FM 101 .K59 2024",
      program: "BSBA-FM",
      shelf_location: "Aisle 3 - Right",
      is_available: true,
    },
    {
      id: 3,
      title: "Marketing Management",
      author: "Philip Kotler",
      call_number: "MM 201 .K68 2023",
      program: "BSBA-MM",
      shelf_location: "Reference Section",
      is_available: false,
    },
    {
      id: 4,
      title: "Educational Psychology",
      author: "John Dewey",
      call_number: "ED 101 .D49 2024",
      program: "BSED",
      shelf_location: "Reserve Section",
      is_available: true,
    },
    {
      id: 5,
      title: "Early Childhood Education",
      author: "Maria Montessori",
      call_number: "EC 201 .M67 2023",
      program: "BEED",
      shelf_location: "Periodical Section",
      is_available: true,
    },
    {
      id: 6,
      title: "World History",
      author: "Howard Zinn",
      call_number: "GE 101 .Z56 2024",
      program: "GEN ED",
      shelf_location: "Multimedia Section",
      is_available: false,
    },
  ]);

  // Mock ebooks data for demonstration
  const [ebooks, setEbooks] = useState([
    {
      id: 1,
      title: "Introduction to Computing",
      author: "Dr. Maria Santos",
      program_name: "BSIT",
      type: "ebook",
      cover_url:
        "https://via.placeholder.com/200x280/0e326c/ffffff?text=Computing",
      file_url: "#",
      file_size: 5242880,
      downloads: 234,
      uploader_name: "Admin",
    },
    {
      id: 2,
      title: "Financial Management Basics",
      author: "Prof. Juan Dela Cruz",
      program_name: "BSBA-FM",
      type: "ebook",
      cover_url:
        "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Finance",
      file_url: "#",
      file_size: 3670016,
      downloads: 189,
      uploader_name: "Admin",
    },
    {
      id: 3,
      title: "Modern Marketing Strategies",
      author: "Ana Reyes",
      program_name: "BSBA-MM",
      type: "ebook",
      cover_url:
        "https://via.placeholder.com/200x280/0e326c/ffffff?text=Marketing",
      file_url: "#",
      file_size: 4194304,
      downloads: 456,
      uploader_name: "Admin",
    },
    {
      id: 4,
      title: "Elementary Education Methods",
      author: "Dr. Luz Mercado",
      program_name: "BEED",
      type: "ebook",
      cover_url:
        "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Education",
      file_url: "#",
      file_size: 2883584,
      downloads: 167,
      uploader_name: "Admin",
    },
  ]);

  // Helper functions for EbookCard
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDownloads = (downloads) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  const handleDownload = (id, title, fileName) => {
    console.log(`Downloading ${title}...`);
    // Implement actual download logic here
  };

  // Handle ebook card click - prevents navigation
  const handleEbookCardClick = (e, ebook) => {
    e.preventDefault();
    e.stopPropagation();
    // Do nothing - no navigation
    console.log("Ebook card clicked, no navigation");
  };

  // Options for react-select
  const resourceTypeOptions = [
    { value: "all", label: "All Resources" },
    { value: "book", label: "Library Books" },
    { value: "ebook", label: "eBooks" },
  ];

  const programOptions = [
    { value: "", label: "All Programs" },
    { value: "BSIT", label: "BSIT" },
    { value: "BSBA-FM", label: "BSBA-FM" },
    { value: "BSBA-MM", label: "BSBA-MM" },
    { value: "BSED", label: "BSED" },
    { value: "BEED", label: "BEED" },
    { value: "GEN ED", label: "GEN ED" },
  ];

  // Close filter drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      if (window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showFilters]);

  // Handle window resize to reset body scroll
  useEffect(() => {
    const handleResize = () => {
      if (!showFilters && window.innerWidth >= 768) {
        document.body.style.overflow = "unset";
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showFilters]);

  // Count active filters
  const activeFilterCount =
    (resourceType !== "all" ? 1 : 0) + (selectedProgram ? 1 : 0);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (resourceType !== "all") params.set("type", resourceType);
    if (selectedProgram) params.set("program", selectedProgram);
    navigate(`/search?${params.toString()}`);
  };

  const applyFiltersAndSearch = () => {
    setShowFilters(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (resourceType !== "all") params.set("type", resourceType);
    if (selectedProgram) params.set("program", selectedProgram);
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setResourceType("all");
    setSelectedProgram("");
  };

  return (
    <>
      <Header />
      <ScrollToTopButton />

      {/* Hero Section */}
      <section
        className="relative min-h-[82vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(10, 25, 47, 0.88), rgba(8, 20, 38, 0.93)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-4 md:mb-5">
              <span className="block sm:inline">Welcome to </span>
              <span className="inline-flex items-center justify-center flex-wrap sm:flex-nowrap">
                <span className="text-blue-600 font-black">OCC</span>
                <span className="inline-flex items-baseline">
                  <span
                    className="font-black"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 900,
                      fontSize: "1.2em",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      marginRight: "1px",
                      color: "white",
                    }}
                  >
                    e
                  </span>
                  <span className="text-white font-black">Library</span>
                </span>
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 md:mb-10 px-4">
              Search books available at our library and eBooks you can read or
              download — all in one place.
            </p>

            {/* Search Bar with Filter Button */}
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto relative"
            >
              <div className="flex items-stretch bg-white rounded-2xl shadow-2xl overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, eBooks, authors, topics..."
                  className="flex-1 px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
                />

                <div className="relative">
                  <button
                    ref={filterButtonRef}
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative h-full px-3 sm:px-4 py-3 sm:py-4 transition-colors duration-200 flex items-center gap-1 sm:gap-2 font-medium ${
                      showFilters || activeFilterCount > 0
                        ? "bg-primary text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline sm:inline">Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="flex-shrink-0 bg-primary hover:bg-primaryDark text-white px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-200 flex items-center gap-1 sm:gap-2 font-medium"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Floating Filter Drawer with CustomSelect */}
              {showFilters && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40 md:absolute md:inset-auto md:bg-transparent"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    onClick={() => setShowFilters(false)}
                  />

                  <div
                    ref={filterRef}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:absolute md:bottom-auto md:top-full md:left-0 md:right-auto md:mt-2 md:w-80 md:rounded-2xl md:max-h-[80vh] md:overflow-y-auto animate-slideUp md:animate-slideDown"
                  >
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 md:hidden" />

                    <div className="p-5 overflow-y-auto max-h-[80vh] md:max-h-none">
                      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-0 pb-2 md:static">
                        <h3 className="font-semibold text-textPrimary text-lg">
                          Filter Resources
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <CustomSelect
                          label="Resource Type"
                          options={resourceTypeOptions}
                          value={resourceType}
                          onChange={setResourceType}
                          placeholder="Select resource type..."
                          isClearable={false}
                          isSearchable={false}
                        />

                        <CustomSelect
                          label="Program"
                          options={programOptions}
                          value={selectedProgram}
                          onChange={setSelectedProgram}
                          placeholder="Select program..."
                          isClearable={true}
                          isSearchable={true}
                        />
                      </div>

                      <div className="flex justify-between gap-3 mt-6 pt-2 sticky bottom-0 bg-white pb-2 md:static">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={applyFiltersAndSearch}
                          className="flex-1 px-5 py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>

                    <div className="h-safe-bottom md:hidden" />
                  </div>
                </>
              )}

              {activeFilterCount > 0 && (
                <div className="flex gap-2 mt-3 justify-center flex-wrap">
                  {resourceType !== "all" && (
                    <span className="text-xs bg-white/15 text-white/90 px-3 py-1 rounded-full border border-white/20">
                      {resourceType === "book" ? "Library Books" : "eBooks"}
                    </span>
                  )}
                  {selectedProgram && (
                    <span className="text-xs bg-white/15 text-white/90 px-3 py-1 rounded-full border border-white/20">
                      {selectedProgram}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs bg-white/10 text-white/70 px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary mb-0.5 md:mb-1">
                500+
              </div>
              <div className="text-xs md:text-sm text-textSecondary">
                eBooks Available
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary mb-0.5 md:mb-1">
                6
              </div>
              <div className="text-xs md:text-sm text-textSecondary">
                Programs
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-3xl font-bold text-primary mb-0.5 md:mb-1">
                3000+
              </div>
              <div className="text-xs md:text-sm text-textSecondary">
                Books Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Program - Using ProgramCard component matching Programs.jsx */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-3 md:mb-4">
              Browse by Program
            </h2>
            <p className="text-sm md:text-base text-textSecondary max-w-2xl mx-auto px-4">
              Find books and eBooks specific to your course or program
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                color={program.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Books Section - Books only with shelf location - No images, List view */}
      <section className="py-12 md:py-20 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-2">
                Popular Books
              </h2>
              <p className="text-sm md:text-base text-textSecondary">
                Most searched physical books available in our library
              </p>
            </div>
            <Link
              to="/browse?tab=books"
              className="text-primary hover:text-primaryDark font-semibold flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              View All Books <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {popularBooks.map((book) => {
              const colors = programColors[book.program];
              return (
                <div
                  key={book.id}
                  className="group block bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`${colors.badge} text-xs font-semibold px-2 py-0.5 rounded-full`}
                          >
                            {book.program}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Library Book
                          </span>
                        </div>
                        <h3 className="font-semibold text-textPrimary mb-1 text-base md:text-lg group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-textSecondary mb-1">
                          {book.author}
                        </p>
                        <p className="text-xs text-textSecondary font-mono">
                          Call No: {book.call_number}
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getShelfLocationColor(book.shelf_location)}`}
                          >
                            {book.shelf_location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest eBooks Section - Using EbookCard with download counts - No navigation on click */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-2">
                Latest eBooks
              </h2>
              <p className="text-sm md:text-base text-textSecondary">
                Newly added digital books available for download
              </p>
            </div>
            <Link
              to="/browse?tab=ebooks"
              className="text-primary hover:text-primaryDark font-semibold flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              Browse All eBooks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                onClick={(e) => handleEbookCardClick(e, ebook)}
                style={{ cursor: "default" }}
              >
                <EbookCard
                  ebook={ebook}
                  onDownload={handleDownload}
                  getProgramColor={getProgramColorBadge}
                  formatFileSize={formatFileSize}
                  formatDownloads={formatDownloads}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-3 md:mb-4">
              Why Use OCC eLibrary?
            </h2>
            <p className="text-sm md:text-base text-textSecondary max-w-2xl mx-auto px-4">
              Your all-in-one resource hub — from physical library books to
              digital eBooks
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                Icon: Library,
                title: "Library Book Search",
                desc: "Check if a physical book is available at the OCC library before heading over",
              },
              {
                Icon: BookOpen,
                title: "Read & Download eBooks",
                desc: "Access and download eBooks directly — read on any device, online or offline",
              },
              {
                Icon: GraduationCap,
                title: "Program-Focused",
                desc: "Resources organized by your specific course or program for fast, focused searching",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="card p-5 md:p-6 text-center hover:-translate-y-1 transition-all"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-textPrimary mb-2">
                  {title}
                </h3>
                <p className="text-sm md:text-base text-textSecondary">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base px-4">
            Search our library catalog and digital eBook collection — find what
            you need, when you need it.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm md:text-base"
          >
            Explore Resources <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .h-safe-bottom {
          height: env(safe-area-inset-bottom);
        }
        
        @media (min-width: 640px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
