// src/pages/EditStudentResearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  BookOpen,
  UserPlus,
  Trash2,
  ArrowLeft,
  Save,
  Eye,
} from "lucide-react";
import CustomSelect from "../components/Select";
import WarningModal from "@/components/modals/WarningModal";

const CATEGORIES = [
  { value: "CAPSTONE", label: "Capstone Project" },
  { value: "BUSINESS RESEARCH", label: "Business Research" },
  { value: "FEASIBILITY STUDY", label: "Feasibility Study" },
  { value: "ACTION RESEARCH", label: "Action Research" },
  { value: "EXPERIMENTAL THESIS", label: "Experimental Thesis" },
];

const getCategoryColor = (category) => {
  const colors = {
    CAPSTONE: "bg-red-100 text-red-700",
    "BUSINESS RESEARCH": "bg-green-100 text-green-700",
    "FEASIBILITY STUDY": "bg-yellow-100 text-yellow-700",
    "ACTION RESEARCH": "bg-blue-100 text-blue-700",
    "EXPERIMENTAL THESIS": "bg-purple-100 text-purple-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

const EditStudentResearch = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existingResearch = location.state?.research;

  const [formData, setFormData] = useState({
    title: existingResearch?.title || "",
    authors: existingResearch?.authors || [""],
    category: existingResearch?.category || "",
    year: existingResearch?.year || new Date().getFullYear(),
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingFile, setExistingFile] = useState({
    name: existingResearch?.file_name,
    size: existingResearch?.file_size,
    url: existingResearch?.file_url,
  });
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const originalData = {
      title: existingResearch?.title || "",
      authors: existingResearch?.authors || [""],
      category: existingResearch?.category || "",
      year: existingResearch?.year || new Date().getFullYear(),
    };

    const hasFormChanges =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    const hasFileChanges = file !== null;

    setHasChanges(hasFormChanges || hasFileChanges);
  }, [formData, file, existingResearch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  const addAuthor = () => {
    setFormData({ ...formData, authors: [...formData.authors, ""] });
  };

  const removeAuthor = (index) => {
    if (formData.authors.length === 1) {
      const newAuthors = [""];
      setFormData({ ...formData, authors: newAuthors });
    } else {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData({ ...formData, authors: newAuthors });
    }
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, category: value });
  };

  const handleYearChange = (e) => {
    setFormData({
      ...formData,
      year: parseInt(e.target.value) || new Date().getFullYear(),
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFileError("Please upload a PDF file only");
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError("File size must be less than 50MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setFileError("");
  };

  const removeExistingFile = () => {
    setExistingFile(null);
    setHasChanges(true);
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 3 - extension.length)}...${extension}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    if (formData.authors.some((author) => !author.trim())) {
      alert("Please enter all author names or remove empty fields");
      return;
    }
    if (!file && !existingFile) {
      alert("Please upload a PDF file");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/student-research");
    }, 1000);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelWarning(true);
    } else {
      navigate("/student-research");
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate("/student-research");
  };

  const selectedCategory = CATEGORIES.find(
    (c) => c.value === formData.category,
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header with Back Button like AddProgram */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Student Research
          </h1>
          <p className="mt-2 text-gray-600">
            Update research paper details and files
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-blue-400 transition-colors">
              {!file ? (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Update PDF File (Optional)
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Leave empty to keep current file, or upload a new PDF
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Maximum file size: 50MB • PDF format only
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      Browse Files
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p
                          className="font-medium text-gray-900 truncate"
                          title={file.name}
                        >
                          {truncateFileName(file.name)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Existing File Display */}
              {existingFile && !file && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Current File:
                  </p>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {existingFile.name || "research_paper.pdf"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {existingFile.size || "Unknown size"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeExistingFile}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Current file will be kept unless you upload a new one or
                    remove it
                  </p>
                </div>
              )}

              {fileError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            {/* Research Details Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Research Details
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="e.g., E-Learning Platform Usability Study for Remote Education"
                    />
                  </div>
                </div>

                {/* Authors with Add Button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Authors <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addAuthor}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Author
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.authors.map((author, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={author}
                            onChange={(e) =>
                              handleAuthorChange(index, e.target.value)
                            }
                            placeholder={`Author ${index + 1} (e.g., Dela Cruz, J.)`}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAuthor(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove author"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter authors in "Last Name, Initial" format (e.g., Dela
                    Cruz, J.)
                  </p>
                </div>

                {/* Category and Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CustomSelect
                      label="Category"
                      options={CATEGORIES}
                      value={formData.category}
                      onChange={handleCategoryChange}
                      placeholder="Select a category..."
                      required={true}
                      isClearable={true}
                      isSearchable={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.year}
                      onChange={handleYearChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Preview */}
                {selectedCategory && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Category Preview:
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedCategory.value)}`}
                      >
                        {selectedCategory.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Instructions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Edit Instructions
            </h3>

            <div className="space-y-4">
              {[
                {
                  n: 1,
                  title: "Update Details",
                  desc: "Modify title, authors, category, or publication year",
                },
                {
                  n: 2,
                  title: "Replace PDF (Optional)",
                  desc: "Upload a new PDF file to replace the current one",
                },
                {
                  n: 3,
                  title: "Save Changes",
                  desc: "Click 'Save Changes' to apply updates",
                },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    {n}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Edit Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>All changes are tracked and applied immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Download and view statistics are preserved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    You can remove the current file without uploading a new one
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Unsaved changes will trigger a confirmation dialog
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Warning Modal */}
      <WarningModal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        onConfirm={handleConfirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? All your changes will be lost."
        confirmText="Leave"
        cancelText="Stay"
        isDanger={false}
      />
    </div>
  );
};

export default EditStudentResearch;
