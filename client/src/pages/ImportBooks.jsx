// src/pages/ImportBooks.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Info,
  Eye,
  FileUp,
  Database,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const ImportBooks = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState("new"); // 'new' or 'update'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");
    setImportPreview(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".json")
    ) {
      setFileError("Please upload a CSV, Excel, or JSON file");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);

    // Simulate preview generation
    setTimeout(() => {
      setImportPreview({
        total: 25,
        valid: 23,
        invalid: 2,
        columns: [
          "accession_number",
          "title",
          "author",
          "call_number",
          "publisher",
          "copyright",
          "isbn",
        ],
        sample: [
          {
            accession_number: "ACC-2024-001",
            title: "Sample Book 1",
            author: "John Smith",
            valid: true,
          },
          {
            accession_number: "ACC-2024-002",
            title: "Sample Book 2",
            author: "Jane Doe",
            valid: true,
          },
          {
            accession_number: "ACC-2024-003",
            title: "", // Missing title
            author: "Bob Wilson",
            valid: false,
          },
        ],
      });
    }, 1000);
  };

  const removeFile = () => {
    setFile(null);
    setImportPreview(null);
    setFileError("");
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      "accession_number",
      "title",
      "author",
      "call_number",
      "publisher",
      "copyright",
      "isbn",
      "edition",
      "volume",
      "pages",
      "status",
      "location",
      "description",
    ].join(",");

    const sampleRow = [
      "ACC-2024-001",
      "Introduction to Programming",
      "John Smith",
      "QA76.6 .S65 2024",
      "Pearson",
      "2024",
      "978-0-13-789456-1",
      "3rd Edition",
      "",
      "450",
      "Available",
      "General Collection",
      "Sample description",
    ].join(",");

    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "book_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded successfully");
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Importing books...");

    try {
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append("file", file);
      // formData.append("mode", importMode);
      // const response = await bookService.importBooks(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast.dismiss(loadingToast);
      toast.success("Books imported successfully");

      // Navigate back to books list
      setTimeout(() => {
        navigate("/books");
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Import error:", error);
      toast.error(error.response?.data?.message || "Failed to import books");
    } finally {
      setLoading(false);
    }
  };

  const truncateFileName = (name, maxLength = 40) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - 3 - extension.length,
    );
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Import Books
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Import Form (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Area */}
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 hover:border-blue-400 transition-colors">
                {!file ? (
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <FileUp className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Import Books from File
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop your CSV, Excel, or JSON file here, or click
                      to browse
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Maximum file size: 10MB • Supported formats: CSV, Excel,
                      JSON
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls,.json"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Select File
                        </span>
                      </label>
                      <button
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-2 px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Template
                      </button>
                    </div>
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

                    {/* Import Mode Selection */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Import Mode
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="importMode"
                            value="new"
                            checked={importMode === "new"}
                            onChange={(e) => setImportMode(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Add as new records
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="importMode"
                            value="update"
                            checked={importMode === "update"}
                            onChange={(e) => setImportMode(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Update existing (match by accession #)
                          </span>
                        </label>
                      </div>
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

              {/* Import Preview */}
              {importPreview && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Import Preview
                    </h3>
                    <div className="flex gap-3">
                      <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {importPreview.valid} Valid
                      </span>
                      <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {importPreview.invalid} Invalid
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Total Records
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {importPreview.total}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">
                        Valid Records
                      </p>
                      <p className="text-2xl font-semibold text-green-700">
                        {importPreview.valid}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-xs text-red-600 mb-1">
                        Invalid Records
                      </p>
                      <p className="text-2xl font-semibold text-red-700">
                        {importPreview.invalid}
                      </p>
                    </div>
                  </div>

                  {/* Columns detected */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Detected Columns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {importPreview.columns.map((col, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample preview */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Sample Preview:
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Accession #
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Title
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Author
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.sample.map((row, index) => (
                            <tr
                              key={index}
                              className={`border-t ${
                                row.valid ? "" : "bg-red-50"
                              }`}
                            >
                              <td className="px-3 py-2 font-mono text-xs">
                                {row.accession_number}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={!row.valid ? "text-red-600" : ""}
                                >
                                  {row.title || (
                                    <span className="text-red-400 italic">
                                      Missing
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="px-3 py-2">{row.author}</td>
                              <td className="px-3 py-2">
                                {row.valid ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {file && (
                <div className="flex gap-4">
                  <button
                    onClick={handleImport}
                    disabled={loading || !file || importPreview?.invalid > 0}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" />
                        <span>Import Books</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/books")}
                    className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Instructions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Import Instructions
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Prepare Your File
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Use CSV, Excel, or JSON format with the required columns
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Required Fields
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        accession_number, title, author, call_number, publisher,
                        copyright
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Optional Fields
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        isbn, edition, volume, pages, status, location,
                        description
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Review & Import
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Check preview for errors before importing
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Important Notes
                  </h4>
                  <ul className="space-y-2 text-xs text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Maximum 1000 records per import</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Accession numbers must be unique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Invalid records will be skipped</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Download template for correct format</span>
                    </li>
                  </ul>
                </div>

                {/* Download Template Button (Mobile/Tablet) */}
                <div className="mt-4 lg:hidden">
                  <button
                    onClick={downloadTemplate}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBooks;
