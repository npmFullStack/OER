// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  Monitor,
  TrendingUp,
  Megaphone,
  BookMarked,
  PenTool,
  Globe,
  Download,
  Library,
  Filter,
  X,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CustomSelect from "@/components/Select";
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

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);
  const navigate = useNavigate();

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
      // Only prevent body scroll on mobile when filter is open
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

  // Count active filters (excluding 'all' and empty string)
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

  const programs = ["BSIT", "BSBA-FM", "BSBA-MM", "BSED", "BEED", "GEN ED"];

  const featuredCategories = [
    { name: "BSIT", count: 45, Icon: Monitor },
    { name: "BSBA-FM", count: 32, Icon: TrendingUp },
    { name: "BSBA-MM", count: 28, Icon: Megaphone },
    { name: "BEED", count: 38, Icon: BookMarked },
    { name: "BSED", count: 42, Icon: PenTool },
    { name: "GEN ED", count: 60, Icon: Globe },
  ];

  const featuredItems = [
    {
      id: 1,
      title: "Introduction to Computing",
      author: "Dr. Maria Santos",
      category: "BSIT",
      type: "ebook",
      cover: "https://via.placeholder.com/200x280/0e326c/ffffff?text=Computing",
    },
    {
      id: 2,
      title: "Financial Management Basics",
      author: "Prof. Juan Dela Cruz",
      category: "BSBA-FM",
      type: "book",
      cover: "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Finance",
    },
    {
      id: 3,
      title: "Modern Marketing Strategies",
      author: "Ana Reyes",
      category: "BSBA-MM",
      type: "ebook",
      cover: "https://via.placeholder.com/200x280/0e326c/ffffff?text=Marketing",
    },
    {
      id: 4,
      title: "Elementary Education Methods",
      author: "Dr. Luz Mercado",
      category: "BEED",
      type: "book",
      cover: "https://via.placeholder.com/200x280/6B9AC4/ffffff?text=Education",
    },
  ];

  return (
    <>
      <Header />

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
            {/* Title - Responsive with line break on mobile */}
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
                {/* Text Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, eBooks, authors, topics..."
                  className="flex-1 px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
                />

                {/* Filter Button with Badge */}
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

                {/* Search Button */}
                <button
                  type="submit"
                  className="flex-shrink-0 bg-primary hover:bg-primaryDark text-white px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-200 flex items-center gap-1 sm:gap-2 font-medium"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Floating Filter Drawer - No height shift, scrollable */}
              {showFilters && (
                <>
                  {/* Backdrop overlay */}
                  <div
                    className="fixed inset-0 bg-black/50 z-40 md:absolute md:inset-auto md:bg-transparent"
                    style={{ top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={() => setShowFilters(false)}
                  />

                  {/* Filter Drawer - Mobile: bottom sheet with scroll, Desktop: dropdown */}
                  <div
                    ref={filterRef}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl md:absolute md:bottom-auto md:top-full md:left-0 md:right-auto md:mt-2 md:w-80 md:rounded-2xl md:max-h-[80vh] md:overflow-y-auto animate-slideUp md:animate-slideDown"
                  >
                    {/* Handle for mobile bottom sheet */}
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
                        {/* Resource Type - Using CustomSelect */}
                        <CustomSelect
                          label="Resource Type"
                          options={resourceTypeOptions}
                          value={resourceType}
                          onChange={setResourceType}
                          placeholder="Select resource type..."
                          isClearable={false}
                          isSearchable={false}
                        />

                        {/* Program - Using CustomSelect */}
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

                    {/* Safe area inset for mobile (iOS) */}
                    <div className="h-safe-bottom md:hidden" />
                  </div>
                </>
              )}

              {/* Active filter pills shown below bar */}
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

      {/* Stats Section - Made responsive */}
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
                50+
              </div>
              <div className="text-xs md:text-sm text-textSecondary">
                Authors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Program - Made responsive */}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {featuredCategories.map((category) => {
              const colors = programColors[category.name];
              return (
                <Link
                  key={category.name}
                  to={`/program/${category.name.toLowerCase().replace(" ", "-")}/resources`}
                  className="group"
                >
                  <div
                    className={`${colors.bg} ${colors.border} border rounded-xl md:rounded-2xl p-3 md:p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center gap-2 md:gap-3`}
                  >
                    <div
                      className={`${colors.iconBg} ${colors.iconColor} w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center`}
                    >
                      <category.Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-textPrimary text-xs md:text-sm mb-0.5">
                        {category.name}
                      </h3>
                      <p className="text-[10px] md:text-xs text-textSecondary">
                        {category.count} resources
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources - Made responsive */}
      <section className="py-12 md:py-20 bg-bgColor">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-2">
                Featured Resources
              </h2>
              <p className="text-sm md:text-base text-textSecondary">
                Popular titles from our library and digital collection
              </p>
            </div>
            <Link
              to="/browse"
              className="text-primary hover:text-primaryDark font-semibold flex items-center gap-2 transition-colors text-sm md:text-base"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredItems.map((item) => {
              const colors = programColors[item.category];
              return (
                <Link
                  key={item.id}
                  to={`/${item.type === "ebook" ? "ebook" : "book"}/${item.id}`}
                  className="group"
                >
                  <div className="card overflow-hidden hover:-translate-y-2 transition-all duration-300 h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div
                        className={`absolute top-2 left-2 ${colors.badge} text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full`}
                      >
                        {item.category}
                      </div>
                      <div
                        className={`absolute top-2 right-2 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${
                          item.type === "ebook"
                            ? "bg-primary/90 text-white"
                            : "bg-gray-800/80 text-white"
                        }`}
                      >
                        {item.type === "ebook" ? "eBook" : "Library Book"}
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-textPrimary mb-1 line-clamp-2 text-sm md:text-base">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-textSecondary">
                        {item.author}
                      </p>
                      {item.type === "ebook" ? (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                          <Download className="w-3 h-3" /> Available for
                          download
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1 text-xs text-textSecondary font-medium">
                          <Library className="w-3 h-3" /> Check availability at
                          library
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Made responsive */}
      <section className="py-12 md:py-20 bg-white">
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

      {/* CTA Section - Made responsive */}
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
