// src/pages/UploadStudentResearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  BookOpen,
  Info,
  Eye,
  UserPlus,
  Trash2,
  ArrowLeft,
  Loader,
} from "lucide-react";
import instruction from "@/assets/images/instruction.png";
import CustomSelect from "../components/Select";
import studentResearchService from "@/services/student-research.service";
import toast from "react-hot-toast";

const UploadStudentResearch = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    authors: [""],
    categoryId: "",
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { categories: data, error } =
      await studentResearchService.getCategories();
    if (!error && data) {
      setCategories(data);
    }
    setLoadingCategories(false);
  };

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
    setFormData({ ...formData, categoryId: value });
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

  const truncateFileName = (name, maxLength = 30) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 3 - extension.length)}...${extension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (formData.authors.some((author) => !author.trim())) {
      toast.error("Please enter all author names or remove empty fields");
      return;
    }
    // File is now optional - removed the file check
    // if (!file) {
    //   toast.error("Please upload a PDF file");
    //   return;
    // }

    setLoading(true);

    // Filter out empty authors
    const filteredAuthors = formData.authors.filter((author) => author.trim());

    const { research, error } = await studentResearchService.createResearch(
      {
        title: formData.title.trim(),
        authors: filteredAuthors,
        categoryId: formData.categoryId,
        year: new Date().getFullYear(),
      },
      file, // Can be null if no file uploaded
    );

    if (error) {
      toast.error(error);
      setLoading(false);
    } else {
      toast.success(
        file
          ? "Research paper uploaded successfully!"
          : "Research details saved successfully!",
      );
      setTimeout(() => {
        navigate("/student-research");
      }, 1000);
    }
  };

  // Format categories for Select component
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/student-research")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Student Research
          </h1>
          <p className="mt-2 text-gray-600">
            Add new student research papers (Capstone, Thesis, Feasibility
            Study, etc.)
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area - Now Optional */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-blue-400 transition-colors">
              {!file ? (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload PDF File{" "}
                    <span className="text-sm font-normal text-gray-500">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your PDF here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Maximum file size: 50MB • PDF format only • You can submit
                    without a file
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
                  <p className="text-xs text-green-600 text-center">
                    ✓ File selected. You can upload another file or proceed
                    without one.
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

                {/* Authors */}
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

                {/* Category Select */}
                <div>
                  <CustomSelect
                    label="Category"
                    options={categoryOptions}
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    placeholder={
                      loadingCategories
                        ? "Loading categories..."
                        : "Select a category..."
                    }
                    required={true}
                    isClearable={true}
                    isSearchable={true}
                    disabled={loadingCategories}
                  />
                </div>

                {/* Category Preview */}
                {selectedCategory && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Category Preview:
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor: selectedCategory.color || "#3b82f6",
                        }}
                      >
                        {selectedCategory.name}
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
                    <Loader className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : file ? (
                  "Upload Research with File"
                ) : (
                  "Save Research Details"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/student-research")}
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
              <Info className="w-5 h-5 text-blue-600" />
              Upload Instructions
            </h3>

            <div className="mb-2 rounded-lg overflow-hidden bg-gray-50 p-4">
              <img
                src={instruction}
                alt="Upload instructions"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Instruction+Guide";
                }}
              />
            </div>

            <div className="space-y-4">
              {[
                {
                  n: 1,
                  title: "Select PDF File (Optional)",
                  desc: "Choose a PDF file from your computer (max 50MB) - not required",
                },
                {
                  n: 2,
                  title: "Fill Research Details",
                  desc: "Add title, authors, and select category (required)",
                },
                {
                  n: 3,
                  title: "Save",
                  desc: "Click save to add the research to the library",
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
                <Eye className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Add all authors to give proper credit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Select the appropriate category for easy filtering
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    You can save research without a PDF file and add it later
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStudentResearch;
