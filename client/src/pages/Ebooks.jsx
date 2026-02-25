// src/pages/Ebooks.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const Ebooks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ebooks, setEbooks] = useState([]);
  const [filteredEbooks, setFilteredEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Course options
  const courses = [
    { value: "BSIT", label: "Information Technology" },
    { value: "BSBA-FM", label: "Financial Management" },
    { value: "BSBA-MM", label: "Marketing Management" },
    { value: "BEED", label: "Elementary Education" },
    { value: "BSED", label: "Secondary Education" },
  ];

  // Year levels
  const yearLevels = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];

  useEffect(() => {
    fetchEbooks();
  }, []);

  useEffect(() => {
    filterEbooks();
  }, [searchTerm, selectedCourse, selectedYear, ebooks]);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = await ebookService.getMyEbooks();
      if (response.success) {
        setEbooks(response.data);
        setFilteredEbooks(response.data);
      } else {
        toast.error(response.message || "Failed to fetch ebooks");
      }
    } catch (error) {
      toast.error("Error loading ebooks");
      console.error("Fetch ebooks error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEbooks = () => {
    let filtered = [...ebooks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((ebook) =>
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Course filter
    if (selectedCourse) {
      filtered = filtered.filter((ebook) => ebook.course === selectedCourse);
    }

    // Year level filter
    if (selectedYear) {
      filtered = filtered.filter((ebook) => ebook.year_level === selectedYear);
    }

    setFilteredEbooks(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCourse("");
    setSelectedYear("");
  };

  const handleDownload = async (ebook) => {
    try {
      const loadingToast = toast.loading("Preparing download...");

      // For now, just show a message since we need to implement the download endpoint
      toast.dismiss(loadingToast);
      toast.success("Download started");

      // You can implement actual download here
      window.open(
        `http://localhost:5000/api/ebooks/${ebook.id}/download`,
        "_blank",
      );
    } catch (error) {
      toast.error("Download failed");
      console.error("Download error:", error);
    }
  };

  const handleDeleteClick = (ebook) => {
    setSelectedEbook(ebook);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEbook) return;

    setDeleteLoading(true);
    const loadingToast = toast.loading("Deleting ebook...");

    try {
      const response = await ebookService.deleteEbook(selectedEbook.id);

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("eBook deleted successfully");
        // Remove from list
        setEbooks(ebooks.filter((e) => e.id !== selectedEbook.id));
        setShowDeleteModal(false);
        setSelectedEbook(null);
      } else {
        toast.error(response.message || "Failed to delete ebook");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Error deleting ebook");
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (ebook) => {
    // Navigate to ebook details page (you can create this later)
    toast.success("View feature coming soon");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEbooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEbooks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getCourseLabel = (courseValue) => {
    const course = courses.find((c) => c.value === courseValue);
    return course ? course.label : courseValue;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My eBooks</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize your uploaded eBooks
          </p>
        </div>
        <button
          onClick={() => navigate("/upload")}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Upload New eBook
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Course filter */}
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none"
            >
              <option value="">All Years</option>
              {yearLevels.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Clear Filters
          </button>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {currentItems.length} of {filteredEbooks.length} eBooks
        </div>
      </div>

      {/* Ebooks List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
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
            {searchTerm || selectedCourse || selectedYear
              ? "Try adjusting your filters"
              : "Start by uploading your first eBook"}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload eBook
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((ebook) => (
                    <tr key={ebook.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600/10 rounded">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {ebook.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {ebook.file_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {getCourseLabel(ebook.course)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-600/10 text-blue-700 rounded-full">
                          Year {ebook.year_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatFileSize(ebook.file_size)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Download className="w-4 h-4" />
                          <span>{ebook.downloads || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(ebook.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(ebook)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDownload(ebook)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ebook)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        currentPage === number
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ),
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
              Are you sure you want to delete "{selectedEbook?.title}"? This
              action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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

export default Ebooks;
