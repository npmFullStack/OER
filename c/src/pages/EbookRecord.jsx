// src/pages/EbookRecord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    id: 1,
    name: "Bachelor of Science in Information Technology",
    acronym: "BSIT",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Bachelor of Science in Computer Science",
    acronym: "BSCS",
    color: "#10b981",
  },
  {
    id: 3,
    name: "Bachelor of Science in Computer Engineering",
    acronym: "BSCpE",
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "Bachelor of Science in Electronics Engineering",
    acronym: "BSECE",
    color: "#8b5cf6",
  },
  {
    id: 5,
    name: "Bachelor of Science in Electrical Engineering",
    acronym: "BSEE",
    color: "#ef4444",
  },
  {
    id: 6,
    name: "Bachelor of Science in Mechanical Engineering",
    acronym: "BSME",
    color: "#06b6d4",
  },
];

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
    views: 1200,
    year_level: 1,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
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
    views: 890,
    year_level: 2,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z",
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
    views: 1540,
    year_level: 2,
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z",
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
    views: 670,
    year_level: 1,
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-20T08:00:00Z",
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
    views: 980,
    year_level: 3,
    created_at: "2024-02-10T08:00:00Z",
    updated_at: "2024-02-10T08:00:00Z",
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
    views: 520,
    year_level: 1,
    created_at: "2024-03-01T08:00:00Z",
    updated_at: "2024-03-01T08:00:00Z",
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
    views: 810,
    year_level: 3,
    created_at: "2024-03-15T08:00:00Z",
    updated_at: "2024-03-15T08:00:00Z",
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
    views: 2100,
    year_level: 2,
    created_at: "2024-04-01T08:00:00Z",
    updated_at: "2024-04-01T08:00:00Z",
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
    views: 1680,
    year_level: 4,
    created_at: "2024-04-15T08:00:00Z",
    updated_at: "2024-04-15T08:00:00Z",
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
    views: 430,
    year_level: 2,
    created_at: "2024-05-01T08:00:00Z",
    updated_at: "2024-05-01T08:00:00Z",
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
    views: 1350,
    year_level: 3,
    created_at: "2024-05-10T08:00:00Z",
    updated_at: "2024-05-10T08:00:00Z",
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
    views: 1920,
    year_level: 4,
    created_at: "2024-05-20T08:00:00Z",
    updated_at: "2024-05-20T08:00:00Z",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const EbookRecord = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [ebook, setEbook] = useState(location.state?.ebook || null);
  const [loading, setLoading] = useState(!location.state?.ebook);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [program, setProgram] = useState(null);
  const [coverError, setCoverError] = useState(false);
  const [coverLoading, setCoverLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!ebook) {
      // Simulate fetch
      const timer = setTimeout(() => {
        const found = EBOOKS.find((e) => String(e.id) === String(id));
        if (found) {
          setEbook(found);
          const prog = PROGRAMS.find((p) => p.id === found.program_id);
          setProgram(prog || null);
        }
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      const prog = PROGRAMS.find((p) => p.id === ebook.program_id);
      setProgram(prog || null);
    }
  }, [id, ebook]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const loadingToast = toast.loading("Preparing download...");
      await new Promise((r) => setTimeout(r, 1000));
      toast.dismiss(loadingToast);
      toast.success("Download started");
      setEbook((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleUpdate = () => {
    setShowMenu(false);
    navigate(`/ebook/update/${ebook.id}`, { state: { ebook } });
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const loadingToast = toast.loading("Deleting ebook...");
    await new Promise((r) => setTimeout(r, 800));
    toast.dismiss(loadingToast);
    toast.success("eBook deleted successfully");
    setDeleteLoading(false);
    navigate("/my-ebooks");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCoverUrl = () => {
    if (!ebook?.cover_url) return null;
    if (ebook.cover_url.startsWith("http")) return ebook.cover_url;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ebook details...</p>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            eBook Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The ebook you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/my-ebooks")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My eBooks
          </button>
        </div>
      </div>
    );
  }

  const coverUrl = getCoverUrl();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Actions */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {ebook.title}
              </h1>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={handleUpdate}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit eBook
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete eBook
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover Image */}
              <div className="flex-shrink-0">
                <div className="w-full md:w-56 h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {coverUrl && !coverError ? (
                    <img
                      src={coverUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                      onError={() => setCoverError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-6">
                      <FileText className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {ebook.title}
                </h2>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full text-white"
                    style={{ backgroundColor: program?.color || "#3b82f6" }}
                  >
                    {program?.acronym || `Year ${ebook.year_level}`}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {formatFileSize(ebook.file_size)}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                    {ebook.downloads || 0} Downloads
                  </span>
                </div>

                {/* Detailed Information Table */}
                <div className="border-t border-gray-200 pt-6">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-4 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                        Program
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                        {program
                          ? `${program.name} (${program.acronym})`
                          : `Year ${ebook.year_level}`}
                      </dd>
                    </div>
                    <div className="py-4 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                        Year Level
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                        Year {ebook.year_level}
                      </dd>
                    </div>
                    <div className="py-4 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                        Upload Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                        {formatDate(ebook.created_at)}
                      </dd>
                    </div>
                    {ebook.updated_at &&
                      ebook.updated_at !== ebook.created_at && (
                        <div className="py-4 flex flex-col sm:flex-row">
                          <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                            Last Updated
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                            {formatDate(ebook.updated_at)}
                          </dd>
                        </div>
                      )}
                    <div className="py-4 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                        File Details
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                        <div className="space-y-1">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            {ebook.file_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Size:</span>{" "}
                            {formatFileSize(ebook.file_size)}
                          </p>
                          <p>
                            <span className="text-gray-500">Type:</span> PDF
                            Document
                          </p>
                        </div>
                      </dd>
                    </div>
                    <div className="py-4 flex flex-col sm:flex-row">
                      <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                        Statistics
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Downloads</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {ebook.downloads || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Views</p>
                            <p className="text-xl font-semibold text-gray-900">
                              {ebook.views || 0}
                            </p>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Preparing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Download eBook</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      toast.error("PDF not available in demo mode")
                    }
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Preview in Browser</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete eBook
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{ebook?.title}"? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EbookRecord;
