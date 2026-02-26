// src/pages/EbookDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  BookOpen,
  Calendar,
  User,
  Layers,
  FileText,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import toast from "react-hot-toast";

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

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace("/api", "");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await ebookService.getEbook(id);
        // API may wrap in data.data or return directly
        setBook(data.data || data);
      } catch (err) {
        console.error("Failed to fetch ebook:", err);
        if (err.response?.status === 404) {
          setError("eBook not found.");
        } else {
          setError("Failed to load eBook details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Preparing download...");
    try {
      const blob = await ebookService.downloadEbook(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = book.file_name || `${book.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });
      // Bump local download count optimistically
      setBook((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const coverSrc = book?.cover_url ? `${API_URL}${book.cover_url}` : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <ScrollToTopButton showAfter={300} />

      <main className="container mx-auto px-4 py-10">
        {/* Back button */}
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
            <div className="w-full md:w-60 flex-shrink-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
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
              {/* Course badge */}
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${getCourseBadgeColor(book.course)}`}
              >
                {book.course}
              </span>

              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                {book.title}
              </h1>

              {/* Meta */}
              <div className="space-y-2 mb-8">
                {book.uploader_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>
                      Uploaded by{" "}
                      <span className="font-medium text-gray-800">
                        {book.uploader_name}
                      </span>
                    </span>
                  </div>
                )}
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
                {book.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>
                      Added{" "}
                      {new Date(book.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none"
              >
                <Download className="w-5 h-5" />
                {downloading ? "Downloading..." : "Download PDF"}
              </button>

              <p className="mt-3 text-xs text-gray-400">
                Free to download · PDF format
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EbookDetails;
