// src/pages/Ebooks.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import EbookCard from "../components/EbookCard";
import ebookService from "@/services/ebook.service";
import authService from "@/services/auth.service";

const Ebooks = () => {
  const navigate = useNavigate();

  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Build program filter options from live data
  const programOptions = [
    ...new Map(
      ebooks.filter((e) => e.program).map((e) => [e.program.id, e.program]),
    ).values(),
  ];

  const fetchEbooks = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        toast.error("Please log in to view your eBooks");
        navigate("/login");
        return;
      }

      let result;
      if (currentUser.role === "superadmin") {
        // Superadmins see all ebooks
        result = await ebookService.getEbooks({
          sortBy: "created_at",
          sortOrder: "desc",
        });
      } else {
        // Admins see only their own uploads
        result = await ebookService.getEbooksByUploader(currentUser.id, {
          sortBy: "created_at",
          sortOrder: "desc",
        });
      }

      if (result.error) {
        toast.error("Failed to load eBooks");
        console.error(result.error);
        setEbooks([]);
        setFilteredEbooks([]);
      } else {
        setEbooks(result.ebooks || []);
        setFilteredEbooks(result.ebooks || []);
      }
    } catch (err) {
      console.error("Fetch ebooks error:", err);
      toast.error("Failed to load eBooks");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEbooks();
  }, [fetchEbooks]);

  // Client-side filter by search + program
  useEffect(() => {
    let filtered = [...ebooks];

    if (searchTerm) {
      filtered = filtered.filter((ebook) =>
        ebook.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (programFilter) {
      filtered = filtered.filter(
        (ebook) => ebook.program?.id === programFilter,
      );
    }

    setFilteredEbooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, programFilter, ebooks]);

  const clearFilters = () => {
    setSearchTerm("");
    setProgramFilter("");
  };

  const activeFilterCount = [searchTerm, programFilter].filter(Boolean).length;

  const getProgramColor = (programAcronym) => {
    const colors = {
      BSIT: "bg-red-100 text-red-800",
      "BSBA-FM": "bg-yellow-100 text-yellow-800",
      "BSBA-MM": "bg-yellow-100 text-yellow-800",
      BSED: "bg-blue-100 text-blue-800",
      BEED: "bg-blue-100 text-blue-800",
      "GEN ED": "bg-green-100 text-green-800",
    };
    return colors[programAcronym] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (value) => {
    if (!value) return "—";
    // Already a formatted string from the DB (e.g. "2.50 MB")
    if (typeof value === "string") return value;
    // Fallback: raw bytes
    if (value === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDownloads = (downloads) => {
    if (!downloads) return "0";
    if (downloads >= 1000) return (downloads / 1000).toFixed(1) + "k";
    return downloads.toString();
  };

  const handleDownload = async (ebookId, title) => {
    const result = await ebookService.downloadEbook(ebookId);
    if (result.error) {
      toast.error("Download failed");
    } else {
      window.open(result.url, "_blank");
      toast.success(`Downloading: ${title}`);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My eBooks</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize your uploaded eBooks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEbooks}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload New eBook
          </button>
        </div>
      </div>

      {/* Search + Program Filter */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="w-48">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Programs</option>
              {programOptions.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.acronym}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {programFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                Program:{" "}
                {programOptions.find((p) => p.id === programFilter)?.acronym}
                <button
                  onClick={() => setProgramFilter("")}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredEbooks.length} eBook
          {filteredEbooks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No eBooks Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || programFilter
              ? "Try adjusting your filters"
              : "Start by uploading your first eBook"}
          </p>
          {!searchTerm && !programFilter && (
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload eBook
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onDownload={handleDownload}
                getProgramColor={() => getProgramColor(ebook.program?.acronym)}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
                formatDownloads={formatDownloads}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Ebooks;
