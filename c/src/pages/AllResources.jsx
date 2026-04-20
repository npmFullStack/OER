// src/pages/AllResources.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Filter,
  X,
  Download,
  ArrowLeft,
  Grid3x3,
  List,
  MapPin,
  GraduationCap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import EbookCard from "@/components/EbookCard";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_EBOOKS = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    cover_url: null,
    program_id: 1,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 1,
    uploader_name: "Prof. John Smith",
    downloads: 1245,
    created_at: "2024-01-15T10:30:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "John Smith",
  },
  {
    id: 2,
    title: "Advanced JavaScript Programming",
    cover_url: null,
    program_id: 1,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 3,
    uploader_name: "Dr. Sarah Johnson",
    downloads: 892,
    created_at: "2024-02-20T14:15:00Z",
    file_size: 3670016,
    file_url: "#",
    author: "Sarah Johnson",
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    cover_url: null,
    program_id: 1,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 2,
    uploader_name: "Prof. Michael Chen",
    downloads: 2156,
    created_at: "2023-11-10T09:00:00Z",
    file_size: 4194304,
    file_url: "#",
    author: "Michael Chen",
  },
  {
    id: 4,
    title: "Digital Logic Design",
    cover_url: null,
    program_id: 2,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 2,
    uploader_name: "Dr. Emily Rodriguez",
    downloads: 567,
    created_at: "2024-01-05T11:20:00Z",
    file_size: 2883584,
    file_url: "#",
    author: "Emily Rodriguez",
  },
  {
    id: 5,
    title: "Network Security Fundamentals",
    cover_url: null,
    program_id: 3,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 3,
    uploader_name: "Prof. David Kim",
    downloads: 1432,
    created_at: "2024-02-01T16:45:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "David Kim",
  },
  {
    id: 6,
    title: "Database Management Systems",
    cover_url: null,
    program_id: 3,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 2,
    uploader_name: "Dr. Lisa Wang",
    downloads: 987,
    created_at: "2023-12-12T13:30:00Z",
    file_size: 3670016,
    file_url: "#",
    author: "Lisa Wang",
  },
  {
    id: 7,
    title: "Software Engineering Principles",
    cover_url: null,
    program_id: 1,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 4,
    uploader_name: "Prof. Robert Taylor",
    downloads: 734,
    created_at: "2024-01-25T08:15:00Z",
    file_size: 4194304,
    file_url: "#",
    author: "Robert Taylor",
  },
  {
    id: 8,
    title: "Web Development Bootcamp",
    cover_url: null,
    program_id: 3,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 1,
    uploader_name: "Sarah Miller",
    downloads: 1876,
    created_at: "2024-02-10T12:00:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Sarah Miller",
  },
  {
    id: 9,
    title: "Computer Architecture",
    cover_url: null,
    program_id: 2,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 3,
    uploader_name: "Dr. James Wilson",
    downloads: 445,
    created_at: "2023-10-20T15:30:00Z",
    file_size: 2883584,
    file_url: "#",
    author: "James Wilson",
  },
  {
    id: 10,
    title: "Artificial Intelligence Basics",
    cover_url: null,
    program_id: 1,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 4,
    uploader_name: "Prof. Anna Martinez",
    downloads: 2100,
    created_at: "2024-02-18T09:45:00Z",
    file_size: 4194304,
    file_url: "#",
    author: "Anna Martinez",
  },
  {
    id: 11,
    title: "Mobile App Development",
    cover_url: null,
    program_id: 3,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 3,
    uploader_name: "Chris Anderson",
    downloads: 1123,
    created_at: "2024-01-08T14:20:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Chris Anderson",
  },
  {
    id: 12,
    title: "Embedded Systems",
    cover_url: null,
    program_id: 2,
    program_acronym: "BSIT",
    program_name: "Information Technology",
    program_color: "#dc2626",
    year_level: 4,
    uploader_name: "Dr. Patricia Lee",
    downloads: 398,
    created_at: "2023-11-28T10:10:00Z",
    file_size: 3670016,
    file_url: "#",
    author: "Patricia Lee",
  },
  // Adding eBooks for other programs
  {
    id: 13,
    title: "Financial Management Fundamentals",
    cover_url: null,
    program_id: 4,
    program_acronym: "BSBA-FM",
    program_name: "Financial Management",
    program_color: "#eab308",
    year_level: 2,
    uploader_name: "Prof. Maria Santos",
    downloads: 567,
    created_at: "2024-02-01T10:30:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Maria Santos",
  },
  {
    id: 14,
    title: "Marketing Strategies for Business",
    cover_url: null,
    program_id: 5,
    program_acronym: "BSBA-MM",
    program_name: "Marketing Management",
    program_color: "#eab308",
    year_level: 3,
    uploader_name: "Dr. Carlos Reyes",
    downloads: 723,
    created_at: "2024-01-20T14:15:00Z",
    file_size: 4194304,
    file_url: "#",
    author: "Carlos Reyes",
  },
  {
    id: 15,
    title: "Educational Psychology",
    cover_url: null,
    program_id: 6,
    program_acronym: "BSED",
    program_name: "Secondary Education",
    program_color: "#3b82f6",
    year_level: 2,
    uploader_name: "Prof. Luz Mercado",
    downloads: 892,
    created_at: "2024-02-10T09:00:00Z",
    file_size: 3670016,
    file_url: "#",
    author: "Luz Mercado",
  },
  {
    id: 16,
    title: "Early Childhood Development",
    cover_url: null,
    program_id: 7,
    program_acronym: "BEED",
    program_name: "Elementary Education",
    program_color: "#3b82f6",
    year_level: 1,
    uploader_name: "Dr. Ana Castillo",
    downloads: 645,
    created_at: "2024-01-28T11:45:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Ana Castillo",
  },
  {
    id: 17,
    title: "World History and Civilization",
    cover_url: null,
    program_id: 8,
    program_acronym: "GEN ED",
    program_name: "General Education",
    program_color: "#10b981",
    year_level: 1,
    uploader_name: "Prof. Jose Rizal",
    downloads: 1234,
    created_at: "2024-02-15T13:20:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Jose Rizal",
  },
  {
    id: 18,
    title: "Corporate Finance",
    cover_url: null,
    program_id: 4,
    program_acronym: "BSBA-FM",
    program_name: "Financial Management",
    program_color: "#eab308",
    year_level: 3,
    uploader_name: "Dr. Elena Gomez",
    downloads: 456,
    created_at: "2023-12-05T10:00:00Z",
    file_size: 3670016,
    file_url: "#",
    author: "Elena Gomez",
  },
  {
    id: 19,
    title: "Consumer Behavior",
    cover_url: null,
    program_id: 5,
    program_acronym: "BSBA-MM",
    program_name: "Marketing Management",
    program_color: "#eab308",
    year_level: 2,
    uploader_name: "Prof. Mark Lopez",
    downloads: 678,
    created_at: "2024-01-12T15:30:00Z",
    file_size: 4194304,
    file_url: "#",
    author: "Mark Lopez",
  },
  {
    id: 20,
    title: "Teaching Strategies and Methods",
    cover_url: null,
    program_id: 6,
    program_acronym: "BSED",
    program_name: "Secondary Education",
    program_color: "#3b82f6",
    year_level: 3,
    uploader_name: "Dr. Fe Santos",
    downloads: 789,
    created_at: "2024-02-05T09:45:00Z",
    file_size: 5242880,
    file_url: "#",
    author: "Fe Santos",
  },
];

const MOCK_BOOKS = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    author: "John Smith, Jane Doe",
    call_number: "CS 101 .S65 2024",
    program: "BSIT",
    shelf_location: "Aisle 1 - Left",
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    author: "Robert Johnson",
    call_number: "CS 201 .J64 2023",
    program: "BSIT",
    shelf_location: "Aisle 1 - Right",
  },
  {
    id: 3,
    title: "Modern Web Development",
    author: "Sarah Williams, Michael Brown",
    call_number: "WEB 301 .W55 2024",
    program: "BSIT",
    shelf_location: "Aisle 2 - Left",
  },
  {
    id: 4,
    title: "Database Management Systems",
    author: "David Chen",
    call_number: "DB 401 .C44 2023",
    program: "BSIT",
    shelf_location: "Aisle 2 - Right",
  },
  {
    id: 5,
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    call_number: "AI 501 .R87 2024",
    program: "BSIT",
    shelf_location: "Aisle 3 - Left",
  },
  {
    id: 6,
    title: "Financial Management Principles",
    author: "Robert Kiyosaki",
    call_number: "FM 101 .K59 2024",
    program: "BSBA-FM",
    shelf_location: "Aisle 3 - Right",
  },
  {
    id: 7,
    title: "Marketing Management",
    author: "Philip Kotler",
    call_number: "MM 201 .K68 2023",
    program: "BSBA-MM",
    shelf_location: "Reference Section",
  },
  {
    id: 8,
    title: "Educational Psychology",
    author: "John Dewey",
    call_number: "ED 101 .D49 2024",
    program: "BSED",
    shelf_location: "Reserve Section",
  },
  {
    id: 9,
    title: "Early Childhood Education",
    author: "Maria Montessori",
    call_number: "EC 201 .M67 2023",
    program: "BEED",
    shelf_location: "Periodical Section",
  },
  {
    id: 10,
    title: "World History",
    author: "Howard Zinn",
    call_number: "GE 101 .Z56 2024",
    program: "GEN ED",
    shelf_location: "Multimedia Section",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];

// Updated program color badges to match Home page
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

const getProgramColor = (program) => {
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

const getShelfLocationColor = () => "bg-blue-600 text-white";

// ─── Main Component ───────────────────────────────────────────────────────────

const AllResources = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read ?tab= from URL (default: ebooks)
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tab === "books" ? "books" : "ebooks";
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  // Sync tab when URL changes (e.g. navigating back/forward)
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/browse?tab=${tab}`, { replace: true });
  };

  // ── eBooks state ──
  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [ebookLoading, setEbookLoading] = useState(true);
  const [showEbookFilters, setShowEbookFilters] = useState(false);
  const [ebookSearch, setEbookSearch] = useState("");
  const [selectedEbookProgram, setSelectedEbookProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [ebookPage, setEbookPage] = useState(1);
  const EBOOK_PER_PAGE = 12;

  // ── Books state ──
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [bookLoading, setBookLoading] = useState(true);
  const [showBookFilters, setShowBookFilters] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBookProgram, setSelectedBookProgram] = useState("");
  const [bookPage, setBookPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(10);
  const BOOK_PER_PAGE = booksPerPage;

  // Load mock data
  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setEbooks(MOCK_EBOOKS);
      setFilteredEbooks(MOCK_EBOOKS);
      setEbookLoading(false);

      setBooks(MOCK_BOOKS);
      setFilteredBooks(MOCK_BOOKS);
      setBookLoading(false);
    };
    load();
  }, []);

  // ── eBook filters ──
  useEffect(() => {
    let filtered = [...ebooks];
    if (ebookSearch.trim()) {
      const q = ebookSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.uploader_name?.toLowerCase().includes(q) ||
          b.program_name?.toLowerCase().includes(q) ||
          b.program_acronym?.toLowerCase().includes(q),
      );
    }
    if (selectedEbookProgram) {
      filtered = filtered.filter(
        (b) => String(b.program_acronym) === selectedEbookProgram,
      );
    }
    if (selectedYear) {
      filtered = filtered.filter((b) => String(b.year_level) === selectedYear);
    }
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
    setEbookPage(1);
  }, [ebooks, ebookSearch, selectedEbookProgram, selectedYear, selectedSort]);

  // ── Book filters ──
  useEffect(() => {
    let filtered = [...books];
    if (bookSearch.trim()) {
      const q = bookSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.call_number?.toLowerCase().includes(q) ||
          b.program?.toLowerCase().includes(q),
      );
    }
    if (selectedBookProgram) {
      filtered = filtered.filter((b) => b.program === selectedBookProgram);
    }
    setFilteredBooks(filtered);
    setBookPage(1);
  }, [books, bookSearch, selectedBookProgram]);

  // Handle books per page change
  const handleBooksPerPageChange = (e) => {
    const value = e.target.value;
    setBooksPerPage(
      value === "all" ? filteredBooks.length : parseInt(value, 10),
    );
    setBookPage(1);
  };

  // Pagination helpers
  const ebookStartIdx = (ebookPage - 1) * EBOOK_PER_PAGE;
  const currentEbooks = filteredEbooks.slice(
    ebookStartIdx,
    ebookStartIdx + EBOOK_PER_PAGE,
  );
  const totalEbookPages = Math.ceil(filteredEbooks.length / EBOOK_PER_PAGE);

  const bookStartIdx = (bookPage - 1) * BOOK_PER_PAGE;
  const currentBooks = filteredBooks.slice(
    bookStartIdx,
    bookStartIdx + BOOK_PER_PAGE,
  );
  const totalBookPages = Math.ceil(filteredBooks.length / BOOK_PER_PAGE);

  const uniqueBookPrograms = [...new Set(MOCK_BOOKS.map((b) => b.program))];
  const uniqueEbookPrograms = [
    ...new Set(MOCK_EBOOKS.map((b) => b.program_acronym)),
  ];

  const clearEbookFilters = () => {
    setEbookSearch("");
    setSelectedEbookProgram("");
    setSelectedYear("");
    setSelectedSort("newest");
  };

  const clearBookFilters = () => {
    setBookSearch("");
    setSelectedBookProgram("");
  };

  const ebookActiveFilters = [
    ebookSearch,
    selectedEbookProgram,
    selectedYear,
  ].filter(Boolean).length;
  const bookActiveFilters = [bookSearch, selectedBookProgram].filter(
    Boolean,
  ).length;

  // Handle download function for EbookCard
  const handleDownload = (id, title, fileName) => {
    console.log(`Downloading ${title}...`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Resources
              </h1>
              <p className="text-sm text-gray-600">
                Browse our complete collection of eBooks and library books
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => handleTabChange("ebooks")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "ebooks"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              eBooks
              {!ebookLoading && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "ebooks" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"}`}
                >
                  {filteredEbooks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("books")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "books"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Library Books
              {!bookLoading && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "books" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"}`}
                >
                  {filteredBooks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── eBooks Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "ebooks" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Search + Filter bar - removed view toggle */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={ebookSearch}
                  onChange={(e) => setEbookSearch(e.target.value)}
                  placeholder="Search by title, author, or program..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                onClick={() => setShowEbookFilters(!showEbookFilters)}
                className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
                  showEbookFilters || ebookActiveFilters > 0
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {ebookActiveFilters > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {ebookActiveFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Filters panel */}
            {showEbookFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Filter eBooks</h3>
                  <button
                    onClick={() => setShowEbookFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Program
                    </label>
                    <select
                      value={selectedEbookProgram}
                      onChange={(e) => setSelectedEbookProgram(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All Programs</option>
                      {uniqueEbookPrograms.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      {yearOptions.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Sort By
                    </label>
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={clearEbookFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Results summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {ebookStartIdx + 1}–
                {Math.min(
                  ebookStartIdx + EBOOK_PER_PAGE,
                  filteredEbooks.length,
                )}{" "}
                of {filteredEbooks.length} eBooks
              </p>
            </div>

            {/* Loading */}
            {ebookLoading && (
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

            {/* Empty */}
            {!ebookLoading && filteredEbooks.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No eBooks Found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearEbookFilters}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Grid view only - using EbookCard component */}
            {!ebookLoading && filteredEbooks.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentEbooks.map((book) => (
                    <div key={book.id} style={{ cursor: "default" }}>
                      <EbookCard
                        ebook={book}
                        onDownload={handleDownload}
                        getProgramColor={getProgramColorBadge}
                        formatFileSize={formatFileSize}
                        formatDownloads={formatDownloads}
                      />
                    </div>
                  ))}
                </div>

                {totalEbookPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setEbookPage((p) => Math.max(p - 1, 1))}
                      disabled={ebookPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(totalEbookPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setEbookPage(i + 1)}
                        className={`w-8 h-8 rounded-lg ${ebookPage === i + 1 ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setEbookPage((p) => Math.min(p + 1, totalEbookPages))
                      }
                      disabled={ebookPage === totalEbookPages}
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
      )}

      {/* ── Books Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "books" && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Search + Filter bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search by title, author, call number, or program..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <button
                onClick={() => setShowBookFilters(!showBookFilters)}
                className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
                  showBookFilters || bookActiveFilters > 0
                    ? "border-primary text-primary bg-primary/5"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {bookActiveFilters > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {bookActiveFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Book filter panel */}
            {showBookFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Filter Books</h3>
                  <button
                    onClick={() => setShowBookFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Program
                    </label>
                    <select
                      value={selectedBookProgram}
                      onChange={(e) => setSelectedBookProgram(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All Programs</option>
                      {uniqueBookPrograms.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={clearBookFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Results summary with Rows Per Page Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm text-gray-600">
                Showing {bookStartIdx + 1}–
                {Math.min(bookStartIdx + BOOK_PER_PAGE, filteredBooks.length)}{" "}
                of {filteredBooks.length} books
              </p>

              {/* Rows per page selector - similar to Books.jsx */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={
                    booksPerPage === filteredBooks.length ? "all" : booksPerPage
                  }
                  onChange={handleBooksPerPageChange}
                  className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white cursor-pointer"
                >
                  <option value={5}>5 records</option>
                  <option value={10}>10 records</option>
                  <option value={20}>20 records</option>
                  <option value={50}>50 records</option>
                  <option value="all">All records</option>
                </select>
              </div>
            </div>

            {/* Loading */}
            {bookLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!bookLoading && filteredBooks.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Books Found
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearBookFilters}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Books list */}
            {!bookLoading && filteredBooks.length > 0 && (
              <>
                <div className="space-y-3">
                  {currentBooks.map((book) => {
                    const programColorClass = getProgramColor(book.program);
                    return (
                      <div
                        key={book.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 md:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span
                                  className={`${programColorClass} text-xs font-semibold px-2 py-0.5 rounded-full`}
                                >
                                  {book.program}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  Library Book
                                </span>
                              </div>
                              <h3 className="font-semibold text-textPrimary mb-1 text-base md:text-lg">
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
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getShelfLocationColor()}`}
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

                {totalBookPages > 1 &&
                  booksPerPage !== filteredBooks.length && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() => setBookPage((p) => Math.max(p - 1, 1))}
                        disabled={bookPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                      >
                        Previous
                      </button>
                      {[...Array(totalBookPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setBookPage(i + 1)}
                          className={`w-8 h-8 rounded-lg ${bookPage === i + 1 ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setBookPage((p) => Math.min(p + 1, totalBookPages))
                        }
                        disabled={bookPage === totalBookPages}
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
      )}

      <Footer />
    </div>
  );
};

export default AllResources;
