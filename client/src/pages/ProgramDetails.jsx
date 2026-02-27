// src/pages/ProgramDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  Download,
  Users,
  Calendar,
  GraduationCap,
  AlertCircle,
  Eye,
  FileText,
  LayoutGrid,
} from "lucide-react";
import programService from "@/services/programService";
import { ebookService } from "@/services/ebookService";
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
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  useEffect(() => {
    fetchProgramDetails();
  }, [id]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);

      // Fetch program details
      const programResponse = await programService.getById(id);
      if (!programResponse.success) {
        throw new Error(programResponse.message || "Failed to load program");
      }
      setProgram(programResponse.data);

      // Fetch ebooks for this program
      const ebooksResponse = await ebookService.getEbooksByProgram(id);
      if (ebooksResponse.success) {
        setEbooks(ebooksResponse.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch program details:", err);
      if (err.response?.status === 404) {
        setError("Program not found.");
      } else {
        setError("Failed to load program details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/programs/edit/${id}`);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${program?.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await programService.delete(id);
      if (response.success) {
        toast.success("Program deleted successfully");
        navigate("/programs");
      } else {
        toast.error(response.message || "Failed to delete program");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error(error.response?.data?.message || "Failed to delete program");
    }
  };

  const handleDownload = async (ebookId, ebookTitle, fileName) => {
    const toastId = toast.loading("Preparing download...");
    try {
      const blob = await ebookService.downloadEbook(ebookId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `${ebookTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started!", { id: toastId });

      // Update download count locally
      setEbooks((prev) =>
        prev.map((ebook) =>
          ebook.id === ebookId
            ? { ...ebook, downloads: (ebook.downloads || 0) + 1 }
            : ebook,
        ),
      );
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Please try again.", { id: toastId });
    }
  };

  const handleRead = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      toast.error("PDF file not available");
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

  // Calculate totals
  const totalEbooks = ebooks.length;
  const totalDownloads = ebooks.reduce(
    (sum, ebook) => sum + (ebook.downloads || 0),
    0,
  );

  return (
    <div className="relative z-10 min-h-screen flex flex-col rounded-xl bg-white">
      {/* Main content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
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
              {loading ? "Loading..." : program?.name}
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
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          Created by {program.created_by_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
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
                        <Link
                          to={`/ebook/${ebook.id}`}
                          className="block aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden"
                        >
                          {ebook.cover_url ? (
                            <img
                              src={ebook.cover_url}
                              alt={ebook.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                                e.target.parentElement.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center">
                                    <BookOpen class="w-12 h-12 text-gray-400" />
                                  </div>
                                `;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                          )}

                          {/* Year Level Badge */}
                          {ebook.year_level && (
                            <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                              {yearSuffix(ebook.year_level)}
                            </span>
                          )}
                        </Link>

                        {/* eBook Info */}
                        <div className="p-4">
                          <Link
                            to={`/ebook/${ebook.id}`}
                            className="block group-hover:text-blue-600 transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                              {ebook.title}
                            </h3>
                          </Link>

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

                          {/* Uploader Info */}
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
