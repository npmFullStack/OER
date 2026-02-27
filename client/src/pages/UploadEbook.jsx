// src/pages/UploadEbook.jsx
import React, { useState, useEffect } from "react";
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
  Eye,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import toast from "react-hot-toast";
import instruction from "@/assets/images/instruction.png";
import * as pdfjsLib from "pdfjs-dist";

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
  const [coverPreview, setCoverPreview] = useState(null);
  const [extractingCover, setExtractingCover] = useState(false);

  // Initialize pdf.js worker - use the version that matches the installed package
  useEffect(() => {
    // Dynamically match the installed pdfjs-dist version
    const pdfjsVersion = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    console.log("PDF.js worker initialized with version:", pdfjsVersion);
  }, []);

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

  const renderPdfPage = async (arrayBuffer) => {
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableRange: true,
      disableStream: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: context, viewport, background: "white" })
      .promise;
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const extractPdfCover = async (file) => {
    setExtractingCover(true);

    const arrayBuffer = await file.arrayBuffer();
    const pdfjsVersion = pdfjsLib.version;

    // Try multiple worker URLs in order
    const workerUrls = [
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`,
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/legacy/build/pdf.worker.min.js`,
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`,
    ];

    let lastError = null;
    for (const workerUrl of workerUrls) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const dataUrl = await renderPdfPage(arrayBuffer.slice(0));
        setCoverPreview(dataUrl);
        toast.success("Cover page extracted successfully!");
        setExtractingCover(false);
        return;
      } catch (err) {
        console.warn(`Worker failed with ${workerUrl}:`, err.message);
        lastError = err;
      }
    }

    // All workers failed
    console.error("All worker URLs failed. Last error:", lastError);
    toast.error("Could not extract cover page, but you can still upload");
    setCoverPreview(null);
    setExtractingCover(false);
  };

  // Helper function to convert dataURL to Blob
  const dataURLtoBlob = (dataURL) => {
    try {
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error("Error converting dataURL to blob:", error);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    setCoverPreview(null);

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

    // Extract and preview the first page
    await extractPdfCover(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setCoverPreview(null);
    setFileError("");
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - 3 - extension.length,
    );
    return `${truncatedName}...${extension}`;
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

    // If we have a cover preview, send it to the server
    if (coverPreview) {
      try {
        // Convert dataURL to blob
        const response = await fetch(coverPreview);
        const blob = await response.blob();
        const coverFile = new File([blob], "cover.jpg", { type: "image/jpeg" });
        uploadData.append("cover", coverFile);
        console.log("✅ Cover image attached to upload", coverFile);
      } catch (err) {
        console.error("Failed to process cover image:", err);
      }
    }

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
        setCoverPreview(null);

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
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload eBook</h1>
        <p className="mt-2 text-gray-600">
          Add new eBooks to the OCC Digital Library
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form (2/3 width) */}
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
                    Upload PDF File
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your PDF here, or click to browse
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

                  {/* Cover Preview */}
                  {extractingCover ? (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 animate-pulse"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Extracting cover page...
                        </p>
                        <p className="text-xs text-gray-500">
                          Please wait while we process your PDF
                        </p>
                      </div>
                    </div>
                  ) : coverPreview ? (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Cover page detected
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          This image will be used as your eBook cover
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  ) : null}
                </div>
              )}

              {fileError && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{fileError}</span>
                </div>
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="e.g., Introduction to Computing"
                    />
                  </div>
                </div>

                {/* Program and Year Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="">Select Program</option>
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
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
                disabled={loading || extractingCover}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Uploading..." : "Upload eBook"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Instructions (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Upload Instructions
            </h3>

            {/* Instruction Image */}
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

            {/* Instruction Steps */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Select PDF File
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a PDF file from your computer (max 50MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cover Page Detection
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    The first page of your PDF will be extracted as the cover
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Fill Book Details
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add title, program, and year level information
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Upload & Confirm
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click upload and wait for confirmation
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Use PDFs with a clear cover page for best results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Optimize PDF size before uploading for faster uploads
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    The preview shows exactly how your cover will look
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

export default UploadEbook;
