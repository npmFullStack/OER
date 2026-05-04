// src/pages/StudentResearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  X,
  Plus,
  Eye,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  ChevronDown,
  Layers,
  Loader,
  FileUp,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import WarningModal from "@/components/modals/WarningModal";
import Select from "@/components/Select";
import NewStudentResearchCategory from "@/components/modals/NewStudentResearchCategory";
import studentResearchService from "@/services/student-research.service";
import toast from "react-hot-toast";

// Options for items per page
const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: "10 records" },
  { value: 20, label: "20 records" },
  { value: 50, label: "50 records" },
];

const StudentResearch = () => {
  const navigate = useNavigate();
  const [research, setResearch] = useState([]);
  const [filteredResearch, setFilteredResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [researchToDelete, setResearchToDelete] = useState(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [downloading, setDownloading] = useState(null);

  // Load data from backend
  useEffect(() => {
    loadResearch();
    loadCategories();
  }, []);

  const loadResearch = async () => {
    setLoading(true);
    const { research: data, error } =
      await studentResearchService.getResearchPapers();
    if (error) {
      toast.error("Failed to load research papers");
      console.error(error);
    } else {
      setResearch(data || []);
      setFilteredResearch(data || []);
      // Extract unique years
      const uniqueYears = [...new Set((data || []).map((r) => r.year))].sort(
        (a, b) => b - a,
      );
      setYears(uniqueYears);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const { categories: data, error } =
      await studentResearchService.getCategories();
    if (!error && data) {
      setCategories(data);
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-700";
    const colors = {
      CAPSTONE: "bg-red-100 text-red-700",
      "BUSINESS RESEARCH": "bg-green-100 text-green-700",
      "FEASIBILITY STUDY": "bg-yellow-100 text-yellow-700",
      "ACTION RESEARCH": "bg-blue-100 text-blue-700",
      "EXPERIMENTAL THESIS": "bg-purple-100 text-purple-700",
    };
    return colors[category.name] || "bg-gray-100 text-gray-700";
  };

  const formatNumber = (n) => {
    if (!n && n !== 0) return "0";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...research];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.authors?.some((author) => author.toLowerCase().includes(q)) ||
          r.category?.name?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((r) => r.category?.id === selectedCategory);
    }

    if (selectedYear) {
      filtered = filtered.filter((r) => r.year === parseInt(selectedYear));
    }

    setFilteredResearch(filtered);
    setCurrentPage(1);
  }, [research, searchTerm, selectedCategory, selectedYear]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedYear("");
    setShowFilters(false);
  };

  const activeFilterCount = [searchTerm, selectedCategory, selectedYear].filter(
    Boolean,
  ).length;

  const handleDeleteClick = (item) => {
    setOpenActionMenu(null);
    setResearchToDelete(item);
    setIsWarningModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (researchToDelete) {
      const { success, error } = await studentResearchService.deleteResearch(
        researchToDelete.id,
      );
      if (error) {
        toast.error(error);
      } else {
        toast.success("Research paper deleted successfully");
        await loadResearch();
      }
      setIsWarningModalOpen(false);
      setResearchToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsWarningModalOpen(false);
    setResearchToDelete(null);
  };

  const handleEdit = (item) => {
    setOpenActionMenu(null);
    navigate(`/student-research/edit/${item.id}`, {
      state: { research: item },
    });
  };

  const handleView = (item) => {
    navigate(`/student-research/view/${item.id}`);
  };

  const handleDownload = async (item) => {
    setDownloading(item.id);
    const { url, error } = await studentResearchService.downloadResearchFile(
      item.id,
    );
    if (error) {
      toast.error(error);
    } else if (url) {
      window.open(url, "_blank");
      toast.success("Download started");
    }
    setDownloading(null);
  };

  const handleUploadResearch = () => {
    setIsAddDropdownOpen(false);
    navigate("/student-research/upload");
  };

  const handleImportResearch = () => {
    setIsAddDropdownOpen(false);
    navigate("/student-research/import");
  };

  const handleManageCategories = () => {
    setIsAddDropdownOpen(false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategories = async () => {
    await loadCategories();
  };

  // Format categories for Select component
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  // Format years for Select component
  const yearOptions = years.map((year) => ({
    value: year,
    label: String(year),
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddDropdownOpen && !event.target.closest(".add-dropdown")) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddDropdownOpen]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResearch.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredResearch.length / itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Research</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize student research papers (Capstone, Thesis, etc.)
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* Import Button */}
          <button
            onClick={handleImportResearch}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <FileUp className="w-5 h-5" />
            Import
          </button>

          {/* Add Button with Dropdown */}
          <div className="relative add-dropdown">
            <button
              onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isAddDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isAddDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleUploadResearch}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  Upload Student Research
                </button>
                <button
                  onClick={handleManageCategories}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                >
                  <Layers className="w-4 h-4 text-gray-400" />
                  Manage Categories
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or category..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
              showFilters || activeFilterCount > 0
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  isClearable={true}
                  isSearchable={true}
                />
              </div>
              <div>
                <Select
                  label="Year"
                  options={yearOptions}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  placeholder="All Years"
                  isClearable={true}
                  isSearchable={false}
                />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Tags */}
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
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                Category:{" "}
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                Year: {selectedYear}
                <button
                  onClick={() => setSelectedYear("")}
                  className="hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredResearch.length} research
          papers
        </div>
      </div>

      {/* Research Table */}
      {filteredResearch.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Research Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || selectedYear
              ? "Try adjusting your filters"
              : "Start by uploading your first student research paper"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Authors
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    File & Stats
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="max-w-xs">
                        {item.authors?.join(", ") || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}
                      >
                        {item.category?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {/* File info */}
                        {item.file_url ? (
                          <button
                            onClick={() => handleDownload(item)}
                            disabled={downloading === item.id}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs group"
                          >
                            {downloading === item.id ? (
                              <Loader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">
                              {item.file_name?.length > 25
                                ? item.file_name.substring(0, 22) + "..."
                                : item.file_name || "document.pdf"}
                            </span>
                            <span className="text-gray-400 text-xs">
                              ({item.file_size || "PDF"})
                            </span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No file attached
                          </span>
                        )}
                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(item.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {formatNumber(item.downloads)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenu(
                            openActionMenu === item.id ? null : item.id,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {openActionMenu === item.id && (
                        <div className="absolute right-4 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleView(item)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(item)}
                            disabled={downloading === item.id}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {downloading === item.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Download
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[180px]">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Show:
              </span>
              <Select
                options={ITEMS_PER_PAGE_OPTIONS}
                value={itemsPerPage}
                onChange={setItemsPerPage}
                placeholder="10 records"
                isClearable={false}
                isSearchable={false}
                className="w-full"
              />
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Category Management Modal */}
      <NewStudentResearchCategory
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategories}
      />

      {/* Warning Modal for Delete */}
      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Research Paper"
        message={`Are you sure you want to delete "${researchToDelete?.title}"? This action cannot be undone and will permanently remove the research paper and its associated files.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};

export default StudentResearch;
