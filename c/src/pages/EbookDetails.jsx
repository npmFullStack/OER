// src/pages/EbookDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  BookOpen,
  FileText,
  GraduationCap,
  AlertCircle,
  Eye,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const EBOOKS = [
  {
    id: "1",
    program_id: 1,
    title: "Introduction to Programming",
    file_name: "intro-programming.pdf",
    file_size: 2048000,
    file_url: "#",
    cover_url: null,
    downloads: 342,
    year_level: 1,
    created_at: "2024-01-10",
    program_acronym: "BSIT",
    program_color: "#3b82f6",
  },
  {
    id: "2",
    program_id: 1,
    title: "Data Structures and Algorithms",
    file_name: "dsa.pdf",
    file_size: 3145728,
    file_url: "#",
    cover_url: null,
    downloads: 289,
    year_level: 2,
    created_at: "2024-01-15",
    program_acronym: "BSIT",
    program_color: "#3b82f6",
  },
  {
    id: "3",
    program_id: 1,
    title: "Database Management Systems",
    file_name: "dbms.pdf",
    file_size: 4194304,
    file_url: "#",
    cover_url: null,
    downloads: 412,
    year_level: 2,
    created_at: "2024-02-01",
    program_acronym: "BSIT",
    program_color: "#3b82f6",
  },
  {
    id: "4",
    program_id: 2,
    title: "Discrete Mathematics",
    file_name: "discrete-math.pdf",
    file_size: 5242880,
    file_url: "#",
    cover_url: null,
    downloads: 198,
    year_level: 1,
    created_at: "2024-01-20",
    program_acronym: "BSCS",
    program_color: "#10b981",
  },
  {
    id: "5",
    program_id: 2,
    title: "Operating Systems Concepts",
    file_name: "os-concepts.pdf",
    file_size: 6291456,
    file_url: "#",
    cover_url: null,
    downloads: 321,
    year_level: 3,
    created_at: "2024-02-10",
    program_acronym: "BSCS",
    program_color: "#10b981",
  },
  {
    id: "6",
    program_id: 3,
    title: "Digital Logic Design",
    file_name: "digital-logic.pdf",
    file_size: 3670016,
    file_url: "#",
    cover_url: null,
    downloads: 156,
    year_level: 1,
    created_at: "2024-03-01",
    program_acronym: "BSCpE",
    program_color: "#f59e0b",
  },
  {
    id: "7",
    program_id: 3,
    title: "Microprocessors and Microcontrollers",
    file_name: "microprocessors.pdf",
    file_size: 4718592,
    file_url: "#",
    cover_url: null,
    downloads: 234,
    year_level: 3,
    created_at: "2024-03-15",
    program_acronym: "BSCpE",
    program_color: "#f59e0b",
  },
  {
    id: "8",
    program_id: 1,
    title: "Web Development Fundamentals",
    file_name: "web-dev.pdf",
    file_size: 2621440,
    file_url: "#",
    cover_url: null,
    downloads: 567,
    year_level: 2,
    created_at: "2024-04-01",
    program_acronym: "BSIT",
    program_color: "#3b82f6",
  },
  {
    id: "9",
    program_id: 2,
    title: "Artificial Intelligence",
    file_name: "ai-fundamentals.pdf",
    file_size: 7340032,
    file_url: "#",
    cover_url: null,
    downloads: 445,
    year_level: 4,
    created_at: "2024-04-15",
    program_acronym: "BSCS",
    program_color: "#10b981",
  },
  {
    id: "10",
    program_id: 4,
    title: "Electronic Circuits Analysis",
    file_name: "circuits.pdf",
    file_size: 5767168,
    file_url: "#",
    cover_url: null,
    downloads: 123,
    year_level: 2,
    created_at: "2024-05-01",
    program_acronym: "BSECE",
    program_color: "#8b5cf6",
  },
  {
    id: "11",
    program_id: 1,
    title: "Software Engineering",
    file_name: "software-eng.pdf",
    file_size: 3932160,
    file_url: "#",
    cover_url: null,
    downloads: 378,
    year_level: 3,
    created_at: "2024-05-10",
    program_acronym: "BSIT",
    program_color: "#3b82f6",
  },
  {
    id: "12",
    program_id: 2,
    title: "Machine Learning Basics",
    file_name: "ml-basics.pdf",
    file_size: 8388608,
    file_url: "#",
    cover_url: null,
    downloads: 512,
    year_level: 4,
    created_at: "2024-05-20",
    program_acronym: "BSCS",
    program_color: "#10b981",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const yearSuffix = (y) => {
  const n = parseInt(y);
  if (n === 1) return "1st Year";
  if (n === 2) return "2nd Year";
  if (n === 3) return "3rd Year";
  if (n === 4) return "4th Year";
  return `Year ${y}`;
};

const EbookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    // Simulate async fetch with mock data
    const timer = setTimeout(() => {
      const found = EBOOKS.find((e) => String(e.id) === String(id));
      if (found) {
        setBook(found);
      } else {
        setError("eBook not found.");
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Preparing download...");
    // Simulate download delay
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Download started!", { id: toastId });
    setBook((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    setDownloading(false);
  };

  const handleRead = () => {
    if (book?.file_url && book.file_url !== "#") {
      window.open(book.file_url, "_blank");
    } else {
      toast.error("PDF file not available in demo mode");
    }
  };

  const coverSrc = book?.cover_url;
  const showCover = coverSrc && !imgError;
  const programColor = book?.program_color || "#3b82f6";

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <Header />
      <ScrollToTopButton showAfter={300} />

      <main className="flex-1 flex items-center py-8 justify-center">
        <div className="container mx-auto px-4 max-w-5xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors focus:outline-none group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col md:flex-row gap-10 animate-pulse">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
              </div>
              <div className="flex-1 space-y-4 py-2">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-12 bg-gray-200 rounded w-48 mt-6" />
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-700">{error}</h2>
              <Link
                to="/search"
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Browse all eBooks
              </Link>
            </div>
          )}

          {/* Book detail */}
          {!loading && !error && book && (
            <div className="flex flex-col md:flex-row gap-10">
              {/* Cover */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg relative">
                  {imgLoading && showCover && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {showCover ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imgLoading ? "opacity-0" : "opacity-100"
                      }`}
                      onLoad={() => setImgLoading(false)}
                      onError={() => {
                        setImgError(true);
                        setImgLoading(false);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                      <BookOpen className="w-16 h-16 text-slate-300" />
                      <p className="text-xs text-slate-400 text-center font-medium line-clamp-4">
                        {book.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Downloads badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg py-2 px-4">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-gray-800">
                    {formatDownloads(book.downloads)}
                  </span>
                  <span>downloads</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 text-white"
                  style={{ backgroundColor: programColor }}
                >
                  {book.program_acronym || book.course || "N/A"}
                </span>

                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                  {book.title}
                </h1>

                <div className="space-y-2 mb-8">
                  {book.year_level && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{yearSuffix(book.year_level)}</span>
                    </div>
                  )}
                  {book.file_size && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{formatFileSize(book.file_size)}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="inline-flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none"
                  >
                    <Download className="w-5 h-5" />
                    {downloading ? "Downloading..." : "Download PDF"}
                  </button>

                  <button
                    onClick={handleRead}
                    className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none"
                  >
                    <Eye className="w-5 h-5" />
                    Read Online
                  </button>
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Free to read and download · PDF format
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EbookDetails;
