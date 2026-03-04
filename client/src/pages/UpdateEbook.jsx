// src/pages/UpdateEbook.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";
import { ebookService } from "@/services/ebookService";
import programService from "@/services/programService";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";

const UpdateEbook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existingEbook = location.state?.ebook;

  const [formData, setFormData] = useState({
    title: "",
    programId: "",
    yearLevel: "",
  });

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!existingEbook);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [extractingCover, setExtractingCover] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);

  // Fetch programs and ebook details on mount
  useEffect(() => {
    fetchPrograms();
    if (!existingEbook && id) {
      fetchEbookDetails();
    } else if (existingEbook) {
      populateForm(existingEbook);
    }
  }, []);

  // Initialize pdf.js worker
  useEffect(() => {
    const pdfjsVersion = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
    console.log("PDF.js worker initialized with version:", pdfjsVersion);
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await programService.getAll();
      if (response.success) {
        setPrograms(response.data || []);
      } else {
        toast.error("Failed to load programs");
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchEbookDetails = async () => {
    try {
      setFetchLoading(true);
      const response = await ebookService.getEbook(id);
      if (response.success) {
        populateForm(response.data);
      } else {
        toast.error("Failed to fetch ebook details");
        navigate("/my-ebooks");
      }
    } catch (error) {
      console.error("Error fetching ebook:", error);
      toast.error("Error loading ebook details");
      navigate("/my-ebooks");
    } finally {
      setFetchLoading(false);
    }
  };

  const populateForm = (ebook) => {
    setFormData({
      title: ebook.title || "",
      programId: ebook.program_id?.toString() || "",
      yearLevel: ebook.year_level?.toString() || "",
    });

    // Set existing cover if available
    if (ebook.cover_url) {
      const baseUrl =
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://192.168.254.106:5000";
      const coverUrl = ebook.cover_url.startsWith("http")
        ? ebook.cover_url
        : `${baseUrl}${ebook.cover_url}`;
      setExistingCover(coverUrl);
    }
  };

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
        setExistingCover(null); // Remove existing cover preview
        setRemoveCover(true); // Mark that we're replacing the cover
        toast.success("Cover page extracted successfully!");
        setExtractingCover(false);
        return;
      } catch (err) {
        console.warn(`Worker failed with ${workerUrl}:`, err.message);
        lastError = err;
      }
    }

    console.error("All worker URLs failed. Last error:", lastError);
    toast.error("Could not extract cover page, but you can still update");
    setCoverPreview(null);
    setExtractingCover(false);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    setCoverPreview(null);

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
    await extractPdfCover(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setCoverPreview(null);
    setFileError("");
    // Don't remove existing cover when just removing new file
  };

  const handleRemoveExistingCover = () => {
    setExistingCover(null);
    setRemoveCover(true);
    toast.success("Cover will be removed on update");
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

    if (!formData.title || !formData.programId || !formData.yearLevel) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const updateData = new FormData();
    updateData.append("title", formData.title);
    updateData.append("programId", formData.programId);
    updateData.append("yearLevel", formData.yearLevel);

    // Add new file if uploaded
    if (file) {
      updateData.append("ebook", file);
    }

    // Handle cover image
    if (coverPreview) {
      // New cover extracted from new PDF
      try {
        const response = await fetch(coverPreview);
        const blob = await response.blob();
        const coverFile = new File([blob], "cover.jpg", { type: "image/jpeg" });
        updateData.append("cover", coverFile);
        console.log("✅ New cover image attached");
      } catch (err) {
        console.error("Failed to process cover image:", err);
      }
    } else if (removeCover && !existingCover) {
      // User wants to remove the cover
      updateData.append("removeCover", "true");
    }

    const loadingToast = toast.loading("Updating eBook...");

    try {
      const response = await ebookService.updateEbook(id, updateData);

      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("eBook updated successfully");

        setTimeout(() => {
          navigate(`/ebook-record/${id}`);
        }, 2000);
      } else {
        toast.error(response.message || "Update failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error.response?.data?.message || "An error occurred during update";
      toast.error(errorMessage);
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get selected program for preview
  const selectedProgram = programs.find(
    (p) => p.id === parseInt(formData.programId),
  );

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ebook details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Update eBook</h1>
          <p className="mt-2 text-gray-600">
            Edit eBook details in the OCC Digital Library
          </p>
        </div>
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

                  {/* Cover Preview from new file */}
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
                          New cover page detected
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          This will replace the existing cover
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                  ) : null}
                </div>
              )}

              {/* Existing Cover Display */}
              {existingCover && !coverPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Current Cover:
                  </p>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={existingCover}
                        alt="Current cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Existing cover image
                      </p>
                      <p className="text-xs text-gray-500">
                        This cover will be kept unless you upload a new PDF
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveExistingCover}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                      title="Remove cover"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
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
                        name="programId"
                        value={formData.programId}
                        onChange={handleChange}
                        required
                        disabled={loadingPrograms}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-100"
                      >
                        <option value="">
                          {loadingPrograms
                            ? "Loading programs..."
                            : "Select Program"}
                        </option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.acronym} - {program.name}
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

                {/* Program Preview (if program selected) */}
                {selectedProgram && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Program Preview:
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: selectedProgram.color }}
                      >
                        {selectedProgram.acronym?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedProgram.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Acronym: {selectedProgram.acronym}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || extractingCover || loadingPrograms}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Updating..." : "Update eBook"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/ebook-record/${id}`)}
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
              Update Instructions
            </h3>

            {/* Instruction Steps */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Update PDF (Optional)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a new PDF file only if you want to replace the
                    current one
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cover Page Updates
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    New PDF = new cover automatically. You can also remove the
                    current cover
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Edit Details
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Update title, program, or year level as needed
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Save Changes
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click update and wait for confirmation
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Update Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Only upload a new PDF if you need to update the file
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Changes are immediate - users will see updated information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Download count and statistics are preserved</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEbook;
