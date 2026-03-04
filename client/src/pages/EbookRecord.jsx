// src/pages/EbookRecord.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MoreVertical,
  ChevronDown,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import programService from "@/services/programService";
import toast from "react-hot-toast";

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
      fetchEbookDetails();
    } else {
      fetchProgramDetails(ebook.program_id);
    }
  }, [ebook]);

  const fetchEbookDetails = async () => {
    try {
      setLoading(true);
      const response = await ebookService.getEbook(id);
      if (response.success) {
        setEbook(response.data);
        fetchProgramDetails(response.data.program_id);
      } else {
        toast.error("Failed to fetch ebook details");
      }
    } catch (error) {
      console.error("Error fetching ebook:", error);
      toast.error("Error loading ebook details");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramDetails = async (programId) => {
    if (!programId) return;
    try {
      const response = await programService.getById(programId);
      if (response.success) {
        setProgram(response.data);
      }
    } catch (error) {
      console.error("Error fetching program:", error);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const loadingToast = toast.loading("Preparing download...");

      const link = document.createElement("a");
      link.href =
        ebook.file_url ||
        `http://192.168.254.106:5000/api/ebooks/${ebook.id}/download`;
      link.target = "_blank";
      link.download = ebook.file_name || `${ebook.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(loadingToast);
      toast.success("Download started");

      // Update download count optimistically
      setEbook((prev) => ({ ...prev, downloads: (prev.downloads || 0) + 1 }));
    } catch (error) {
      console.error("Download error:", error);
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

    try {
      const response = await ebookService.deleteEbook(ebook.id);

      toast.dismiss(loadingToast);

      if (response && response.success) {
        toast.success("eBook deleted successfully");
        navigate("/my-ebooks");
      } else {
        toast.error(response?.message || "Failed to delete ebook");
        setShowDeleteModal(false);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Error deleting ebook");
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
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
    if (ebook.cover_url.startsWith("http")) {
      return ebook.cover_url;
    }
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://192.168.254.106:5000";
    return `${baseUrl}${ebook.cover_url}`;
  };

  const getProgramDisplay = () => {
    if (program) {
      return `${program.name} (${program.acronym})`;
    }
    return `Year ${ebook.year_level}`;
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                {ebook.title}
              </h1>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Actions</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
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
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Cover Image */}
                <div className="md:w-72 flex-shrink-0">
                  <div className="relative w-full h-96 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-md">
                    {coverLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {coverUrl && !coverError ? (
                      <img
                        src={coverUrl}
                        alt={ebook.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          coverLoading ? "opacity-0" : "opacity-100"
                        }`}
                        onLoad={() => setCoverLoading(false)}
                        onError={() => {
                          setCoverError(true);
                          setCoverLoading(false);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details - Informative version without icons */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {ebook.title}
                  </h2>

                  {/* Quick Info Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
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
                      {/* Program Information */}
                      <div className="py-4 flex flex-col sm:flex-row">
                        <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                          Program
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          {program ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: program.color || "#3b82f6",
                                }}
                              ></span>
                              <span>
                                {program.name} ({program.acronym})
                              </span>
                            </div>
                          ) : (
                            `Year ${ebook.year_level}`
                          )}
                        </dd>
                      </div>

                      {/* Year Level */}
                      <div className="py-4 flex flex-col sm:flex-row">
                        <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                          Year Level
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          Year {ebook.year_level}
                        </dd>
                      </div>

                      {/* Upload Date */}
                      <div className="py-4 flex flex-col sm:flex-row">
                        <dt className="text-sm font-medium text-gray-500 sm:w-1/3">
                          Upload Date
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:w-2/3">
                          {formatDate(ebook.created_at)}
                        </dd>
                      </div>

                      {/* Last Updated */}
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

                      {/* File Information */}
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

                      {/* Statistics */}
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
                      onClick={() => window.open(ebook.file_url, "_blank")}
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
              cannot be undone and all associated data will be permanently
              removed.
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
