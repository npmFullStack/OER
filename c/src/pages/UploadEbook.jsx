// src/pages/UploadEbook.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Info,
  Eye,
} from "lucide-react";
import instruction from "@/assets/images/instruction.png";
import * as pdfjsLib from "pdfjs-dist";
import CustomSelect from "../components/Select";
import toast from "react-hot-toast";

const PROGRAMS = [
  { value: 1, label: "BSIT - Bachelor of Science in Information Technology" },
  {
    value: 2,
    label:
      "BSBA-FM - Bachelor of Science in Business Administration - Financial Management",
  },
  {
    value: 3,
    label:
      "BSBA-MM - Bachelor of Science in Business Administration - Marketing Management",
  },
  { value: 4, label: "BSED - Bachelor of Secondary Education" },
  { value: 5, label: "BEED - Bachelor in Elementary Education" },
  { value: 6, label: "GEN ED - General Education" },
];

// Program color mapping for preview
const PROGRAM_COLORS = {
  1: "#ef4444", // BSIT - red
  2: "#eab308", // BSBA-FM - yellow
  3: "#eab308", // BSBA-MM - yellow
  4: "#3b82f6", // BSED - blue
  5: "#3b82f6", // BEED - blue
  6: "#10b981", // GEN ED - green
};

const PROGRAM_ACRONYMS = {
  1: "BSIT",
  2: "BSBA-FM",
  3: "BSBA-MM",
  4: "BSED",
  5: "BEED",
  6: "GEN ED",
};

const UploadEbook = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    programId: "",
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [extractingCover, setExtractingCover] = useState(false);

  useEffect(() => {
    const pdfjsVersion = pdfjsLib.version;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProgramChange = (value) => {
    setFormData({ ...formData, programId: value });
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

    for (const workerUrl of workerUrls) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        const dataUrl = await renderPdfPage(arrayBuffer.slice(0));
        setCoverPreview(dataUrl);
        setExtractingCover(false);
        return;
      } catch (err) {
        console.warn(`Worker failed with ${workerUrl}:`, err.message);
      }
    }

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
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 3 - extension.length)}...${extension}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.programId) {
      toast.error("Please select a program");
      return;
    }
    if (!file) {
      toast.error("Please upload a PDF file");
      return;
    }

    setLoading(true);
    // Simulate upload
    setTimeout(() => {
      setLoading(false);
      toast.success("eBook uploaded successfully!");
      navigate("/my-ebooks");
    }, 1000);
  };

  const selectedProgramId = formData.programId;
  const selectedProgramColor = PROGRAM_COLORS[selectedProgramId];
  const selectedProgramAcronym = PROGRAM_ACRONYMS[selectedProgramId];

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header with back button and title - Matching other pages */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/my-ebooks")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload eBook</h1>
          <p className="mt-2 text-gray-600">
            Add new eBooks to the OCC Digital Library
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit}>
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

                {/* Program Select using CustomSelect */}
                <div>
                  <CustomSelect
                    label="Program"
                    options={PROGRAMS}
                    value={formData.programId}
                    onChange={handleProgramChange}
                    placeholder="Select a program..."
                    required={true}
                    isClearable={true}
                    isSearchable={true}
                  />
                </div>

                {/* Program Preview */}
                {selectedProgramId && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Program Preview:
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                        style={{ backgroundColor: selectedProgramColor }}
                      >
                        {selectedProgramAcronym?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {
                            PROGRAMS.find((p) => p.value === selectedProgramId)
                              ?.label
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          Acronym: {selectedProgramAcronym}
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
                onClick={handleSubmit}
                disabled={loading || extractingCover}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Uploading..." : "Upload eBook"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-ebooks")}
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

            <div className="mb-4 rounded-lg overflow-hidden bg-gray-50 p-4">
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
                  title: "Select PDF File",
                  desc: "Choose a PDF file from your computer (max 50MB)",
                },
                {
                  n: 2,
                  title: "Cover Page Detection",
                  desc: "The first page of your PDF will be extracted as the cover",
                },
                {
                  n: 3,
                  title: "Fill Book Details",
                  desc: "Add title and program information",
                },
                {
                  n: 4,
                  title: "Upload & Confirm",
                  desc: "Click upload and wait for confirmation",
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
