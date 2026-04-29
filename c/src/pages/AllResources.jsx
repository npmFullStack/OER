// src/pages/AllResources.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import EbooksTab from "@/components/EbooksTab";
import BooksTab from "@/components/BooksTab";
import StudentResearchTab from "@/components/StudentResearchTab";

// Mock data
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
    file_name: "intro-to-cs.pdf",
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
    file_name: "advanced-js.pdf",
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
    file_name: "ds-algorithms.pdf",
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
    file_name: "digital-logic.pdf",
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
    file_name: "network-security.pdf",
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
    file_name: "dbms.pdf",
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
    file_name: "software-eng.pdf",
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
    file_name: "web-dev.pdf",
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
    file_name: "comp-arch.pdf",
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
    file_name: "ai-basics.pdf",
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
    file_name: "mobile-dev.pdf",
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
    file_name: "embedded-sys.pdf",
  },
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
    file_name: "financial-mgmt.pdf",
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
    file_name: "marketing-strategies.pdf",
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
    file_name: "edu-psych.pdf",
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
    file_name: "early-childhood.pdf",
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
    file_name: "world-history.pdf",
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
    file_name: "corp-finance.pdf",
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
    file_name: "consumer-behavior.pdf",
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
    file_name: "teaching-strategies.pdf",
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

// Mock research data for count
const MOCK_RESEARCH = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
];

const AllResources = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tab === "books"
      ? "books"
      : tab === "student-research"
        ? "student-research"
        : "ebooks";
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl);
  const [ebooks, setEbooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [research, setResearch] = useState([]);
  const [ebookLoading, setEbookLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(true);
  const [researchLoading, setResearchLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/browse?tab=${tab}`, { replace: true });
  };

  // Load mock data
  useEffect(() => {
    const load = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setEbooks(MOCK_EBOOKS);
      setEbookLoading(false);
      setBooks(MOCK_BOOKS);
      setBookLoading(false);
      setResearch(MOCK_RESEARCH);
      setResearchLoading(false);
    };
    load();
  }, []);

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
                Browse our complete collection of eBooks, library books, and
                student research
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
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === "ebooks"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {ebooks.length}
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
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === "books"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {books.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("student-research")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "student-research"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Student Research
              {!researchLoading && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === "student-research"
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {research.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {activeTab === "ebooks" && (
            <EbooksTab
              ebooks={ebooks}
              loading={ebookLoading}
              onDownload={handleDownload}
            />
          )}
          {activeTab === "books" && (
            <BooksTab books={books} loading={bookLoading} />
          )}
          {activeTab === "student-research" && <StudentResearchTab />}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AllResources;
