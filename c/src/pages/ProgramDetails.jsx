// src/pages/ProgramDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Download,
  Calendar,
  AlertCircle,
  Eye,
  MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    id: "1",
    name: "Bachelor of Science in Information Technology",
    acronym: "BSIT",
    color: "#3b82f6",
    created_at: "2023-01-15T08:00:00Z",
  },
  {
    id: "2",
    name: "Bachelor of Science in Computer Science",
    acronym: "BSCS",
    color: "#10b981",
    created_at: "2023-02-20T08:00:00Z",
  },
  {
    id: "3",
    name: "Bachelor of Science in Computer Engineering",
    acronym: "BSCpE",
    color: "#f59e0b",
    created_at: "2023-03-10T08:00:00Z",
  },
  {
    id: "4",
    name: "Bachelor of Science in Electronics Engineering",
    acronym: "BSECE",
    color: "#8b5cf6",
    created_at: "2023-04-05T08:00:00Z",
  },
  {
    id: "5",
    name: "Bachelor of Science in Electrical Engineering",
    acronym: "BSEE",
    color: "#ef4444",
    created_at: "2023-05-12T08:00:00Z",
  },
  {
    id: "6",
    name: "Bachelor of Science in Mechanical Engineering",
    acronym: "BSME",
    color: "#06b6d4",
    created_at: "2023-06-18T08:00:00Z",
  },
];

const ALL_EBOOKS = [
  {
    id: "1",
    program_id: "1",
    title: "Introduction to Programming",
    file_name: "intro-programming.pdf",
    file_size: 2048000,
    file_url: "#",
    cover_url: null,
    downloads: 342,
    year_level: 1,
    created_at: "2024-01-10T08:00:00Z",
    uploader_name: "Prof. Santos",
  },
  {
    id: "2",
    program_id: "1",
    title: "Data Structures and Algorithms",
    file_name: "dsa.pdf",
    file_size: 3145728,
    file_url: "#",
    cover_url: null,
    downloads: 289,
    year_level: 2,
    created_at: "2024-01-15T08:00:00Z",
    uploader_name: "Prof. Reyes",
  },
  {
    id: "3",
    program_id: "1",
    title: "Database Management Systems",
    file_name: "dbms.pdf",
    file_size: 4194304,
    file_url: "#",
    cover_url: null,
    downloads: 412,
    year_level: 2,
    created_at: "2024-02-01T08:00:00Z",
    uploader_name: "Prof. Lim",
  },
  {
    id: "4",
    program_id: "2",
    title: "Discrete Mathematics",
    file_name: "discrete-math.pdf",
    file_size: 5242880,
    file_url: "#",
    cover_url: null,
    downloads: 198,
    year_level: 1,
    created_at: "2024-01-20T08:00:00Z",
    uploader_name: "Prof. Garcia",
  },
  {
    id: "5",
    program_id: "2",
    title: "Operating Systems Concepts",
    file_name: "os-concepts.pdf",
    file_size: 6291456,
    file_url: "#",
    cover_url: null,
    downloads: 321,
    year_level: 3,
    created_at: "2024-02-10T08:00:00Z",
    uploader_name: "Prof. Cruz",
  },
  {
    id: "6",
    program_id: "3",
    title: "Digital Logic Design",
    file_name: "digital-logic.pdf",
    file_size: 3670016,
    file_url: "#",
    cover_url: null,
    downloads: 156,
    year_level: 1,
    created_at: "2024-03-01T08:00:00Z",
    uploader_name: "Prof. Torres",
  },
  {
    id: "7",
    program_id: "3",
    title: "Microprocessors and Microcontrollers",
    file_name: "microprocessors.pdf",
    file_size: 4718592,
    file_url: "#",
    cover_url: null,
    downloads: 234,
    year_level: 3,
    created_at: "2024-03-15T08:00:00Z",
    uploader_name: "Prof. Navarro",
  },
  {
    id: "8",
    program_id: "1",
    title: "Web Development Fundamentals",
    file_name: "web-dev.pdf",
    file_size: 2621440,
    file_url: "#",
    cover_url: null,
    downloads: 567,
    year_level: 2,
    created_at: "2024-04-01T08:00:00Z",
    uploader_name: "Prof. Santos",
  },
  {
    id: "9",
    program_id: "2",
    title: "Artificial Intelligence",
    file_name: "ai-fundamentals.pdf",
    file_size: 7340032,
    file_url: "#",
    cover_url: null,
    downloads: 445,
    year_level: 4,
    created_at: "2024-04-15T08:00:00Z",
    uploader_name: "Prof. Reyes",
  },
  {
    id: "10",
    program_id: "4",
    title: "Electronic Circuits Analysis",
    file_name: "circuits.pdf",
    file_size: 5767168,
    file_url: "#",
    cover_url: null,
    downloads: 123,
    year_level: 2,
    created_at: "2024-05-01T08:00:00Z",
    uploader_name: "Prof. Dela Cruz",
  },
  {
    id: "11",
    program_id: "1",
    title: "Software Engineering",
    file_name: "software-eng.pdf",
    file_size: 3932160,
    file_url: "#",
    cover_url: null,
    downloads: 378,
    year_level: 3,
    created_at: "2024-05-10T08:00:00Z",
    uploader_name: "Prof. Lim",
  },
  {
    id: "12",
    program_id: "2",
    title: "Machine Learning Basics",
    file_name: "ml-basics.pdf",
    file_size: 8388608,
    file_url: "#",
    cover_url: null,
    downloads: 512,
    year_level: 4,
    created_at: "2024-05-20T08:00:00Z",
    uploader_name: "Prof. Garcia",
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

const ProgramDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Simulate async fetch from mock data
    const timer = setTimeout(() => {
      const foundProgram = PROGRAMS.find((p) => String(p.id) === String(id));
      if (foundProgram) {
        setProgram(foundProgram);
        const programEbooks = ALL_EBOOKS.filter(
          (e) => String(e.program_id) === String(id),
        );
        setEbooks(programEbooks);
      } else {
        setError("Program not found.");
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    setShowActionMenu(false);
    navigate(`/programs/edit/${id}`);
  };

  const handleDelete = () => {
    setShowActionMenu(false);
    if (
      !window.confirm(
        `Are you sure you want to delete "${program?.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    toast.success("Program deleted successfully");
    navigate("/programs");
  };

  const handleDownload = async (ebookId, ebookTitle, fileName) => {
    const toastId = toast.loading("Preparing download...");
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Download started!", { id: toastId });
    setEbooks((prev) =>
      prev.map((ebook) =>
        ebook.id === ebookId
          ? { ...ebook, downloads: (ebook.downloads || 0) + 1 }
          : ebook,
      ),
    );
  };

  const handleRead = (fileUrl) => {
    if (fileUrl && fileUrl !== "#") {
      window.open(fileUrl, "_blank");
    } else {
      toast.error("PDF not available in demo mode");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalEbooks = ebooks.length;
  const totalDownloads = ebooks.reduce((sum, e) => sum + (e.downloads || 0), 0);

  return (
    <div className="relative z-10 min-h-screen flex flex-col rounded-xl bg-white">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link
              to="/programs"
              className="hover:text-gray-900 transition-colors"
            >
              Programs
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {loading ? "Loading..." : program?.acronym || program?.name}
            </span>
          </nav>

          {/* Loading state */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading program details...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error}
              </h3>
              <button
                onClick={() => navigate("/programs")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Programs
              </button>
            </div>
          )}

          {/* Program details */}
          {!loading && !error && program && (
            <>
              {/* Program Header with Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: program.color }}
                    >
                      {program.acronym?.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {program.name}
                      </h1>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono text-sm font-medium text-gray-500">
                          {program.acronym}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: program.color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Button Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowActionMenu(!showActionMenu)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <span>Actions</span>
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActionMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={handleEdit}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Program
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Program
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Program Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total eBooks</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {totalEbooks}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Downloads</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDownloads(totalDownloads)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Added</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDate(program.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* eBooks Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    eBooks in this Program
                  </h2>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {totalEbooks} {totalEbooks === 1 ? "eBook" : "eBooks"}
                  </span>
                </div>

                {ebooks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gray-50 rounded-full">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No eBooks Yet
                    </h3>
                    <p className="text-gray-600">
                      This program doesn't have any eBooks uploaded yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ebooks.map((ebook) => (
                      <div
                        key={ebook.id}
                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        {/* eBook Cover */}
                        <div
                          onClick={() => navigate(`/ebook-record/${ebook.id}`)}
                          className="block aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden cursor-pointer"
                        >
                          {ebook.cover_url ? (
                            <img
                              src={ebook.cover_url}
                              alt={ebook.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          {ebook.year_level && (
                            <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                              {yearSuffix(ebook.year_level)}
                            </span>
                          )}
                        </div>

                        {/* eBook Info */}
                        <div className="p-4">
                          <div
                            onClick={() =>
                              navigate(`/ebook-record/${ebook.id}`)
                            }
                            className="cursor-pointer group-hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                              {ebook.title}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Download className="w-4 h-4" />
                              <span>{formatDownloads(ebook.downloads)}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatFileSize(ebook.file_size)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRead(ebook.file_url)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Read
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(
                                  ebook.id,
                                  ebook.title,
                                  ebook.file_name,
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>

                          <p className="mt-3 text-xs text-gray-400">
                            Uploaded by {ebook.uploader_name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramDetails;
