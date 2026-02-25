// src/pages/UploadEbook.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  Info,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import toast from "react-hot-toast";

const UploadEbook = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    course: "",
    yearLevel: "",
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  // Course options
  const courses = [
    { value: "BSIT", label: "Bachelor of Science in Information Technology" },
    { value: "BSBA-FM", label: "BSBA Financial Management" },
    { value: "BSBA-MM", label: "BSBA Marketing Management" },
    { value: "BEED", label: "Bachelor of Elementary Education" },
    { value: "BSED", label: "Bachelor of Secondary Education" },
  ];

  // Year levels
  const yearLevels = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check if file is PDF
    if (selectedFile.type !== "application/pdf") {
      setFileError("Please upload a PDF file only");
      setFile(null);
      return;
    }

    // Check file size (max 50MB)
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!file) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (!formData.title || !formData.course || !formData.yearLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const uploadData = new FormData();
    uploadData.append("ebook", file);
    uploadData.append("title", formData.title);
    uploadData.append("course", formData.course);
    uploadData.append("yearLevel", formData.yearLevel);

    const loadingToast = toast.loading("Uploading eBook...");

    try {
      const response = await ebookService.uploadEbook(uploadData);

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("eBook uploaded successfully");

        // Reset form
        setFormData({
          title: "",
          course: "",
          yearLevel: "",
        });
        setFile(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        toast.error(response.message || "Upload failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error.response?.data?.message || "An error occurred during upload";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload eBook</h1>
        <p className="mt-2 text-gray-600">
          Upload PDF files to the OCC Digital Library
        </p>
      </div>

      {/* Cover Page Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Cover Page Information:</p>
          <p>
            The first page of your PDF file will automatically be used as the
            eBook cover page. Make sure your PDF's first page is the cover/title
            page for best results.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
          {!file ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600/10 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload PDF File
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your PDF here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Maximum file size: 50MB • First page becomes cover
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Browse Files
                </span>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}

          {fileError && (
            <p className="mt-4 text-sm text-red-600 text-center">{fileError}</p>
          )}
        </div>

        {/* Book Details Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Book Details
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="e.g., Introduction to Computing"
                />
              </div>
            </div>

            {/* Course and Year Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none"
                  >
                    <option value="">Select Year Level</option>
                    {yearLevels.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload eBook"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadEbook;
