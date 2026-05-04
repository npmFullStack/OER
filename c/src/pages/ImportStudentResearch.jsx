// src/pages/ImportStudentResearch.jsx
import React, { useState, useEffect } from "react";
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
  FileUp,
  Database,
  HelpCircle,
  Eye,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import studentResearchService from "@/services/student-research.service";
import instruction from "@/assets/images/instruction.png";

const ImportStudentResearch = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState("new"); // 'new' or 'update'
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories for validation
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

  const validCategories = categories.map((cat) => cat.name.toUpperCase());

  // Parse CSV file
  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return [];

    // Get headers from first line
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    // Validate required headers
    const requiredHeaders = ["title", "authors", "category", "year"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const results = [];
    const currentYear = new Date().getFullYear();

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines

      // Simple CSV parsing (handles quoted values)
      const row = [];
      let inQuotes = false;
      let currentValue = "";
      let chars = lines[i].split("");

      for (let j = 0; j < chars.length; j++) {
        const char = chars[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          row.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue.trim());

      // Map row to headers
      const record = {};
      headers.forEach((header, index) => {
        if (index < row.length) {
          record[header] = row[index];
        } else {
          record[header] = "";
        }
      });

      // Validate record
      const errors = [];
      const warnings = [];

      // Validate title
      if (!record.title || record.title.trim() === "") {
        errors.push("Title is required");
      }

      // Validate authors
      if (!record.authors || record.authors.trim() === "") {
        errors.push("Authors are required");
      }

      // Validate category
      let validCategory = null;
      if (!record.category || record.category.trim() === "") {
        errors.push("Category is required");
      } else {
        const categoryUpper = record.category.toUpperCase().trim();
        const matchedCategory = categories.find(
          (c) => c.name.toUpperCase() === categoryUpper,
        );
        if (matchedCategory) {
          validCategory = matchedCategory;
        } else {
          errors.push(
            `Invalid category: "${record.category}". Valid categories: ${validCategories.join(", ")}`,
          );
        }
      }

      // Validate year
      let validYear = null;
      if (!record.year || record.year.trim() === "") {
        errors.push("Year is required");
      } else {
        const yearNum = parseInt(record.year);
        if (isNaN(yearNum)) {
          errors.push(`Invalid year format: "${record.year}"`);
        } else if (yearNum < 1900 || yearNum > currentYear + 5) {
          errors.push(`Year must be between 1900 and ${currentYear + 5}`);
        } else {
          validYear = yearNum;
        }
      }

      results.push({
        original: record,
        title: record.title?.trim() || "",
        authors: record.authors?.trim() || "",
        category: record.category?.trim() || "",
        categoryId: validCategory?.id || null,
        year: validYear,
        abstract: record.abstract?.trim() || "",
        keywords: record.keywords?.trim() || "",
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        rowNumber: i,
      });
    }

    return results;
  };

  // Parse Excel file (using simple approach - for XLSX you'd need xlsx library)
  // For now, we'll handle CSV and JSON, and show error for Excel
  const handleFileChange = async (e) => {
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
    setParsing(true);

    try {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      let parsedData = [];

      if (fileExtension === "csv") {
        // Parse CSV
        const text = await selectedFile.text();
        parsedData = parseCSV(text);
      } else if (fileExtension === "json") {
        // Parse JSON
        const text = await selectedFile.text();
        const jsonData = JSON.parse(text);
        // Convert JSON to expected format
        parsedData = jsonData.map((item, index) => {
          const errors = [];

          if (!item.title) errors.push("Title is required");
          if (!item.authors) errors.push("Authors are required");

          let validCategory = null;
          if (!item.category) {
            errors.push("Category is required");
          } else {
            const categoryUpper = item.category.toUpperCase();
            const matchedCategory = categories.find(
              (c) => c.name.toUpperCase() === categoryUpper,
            );
            if (matchedCategory) {
              validCategory = matchedCategory;
            } else {
              errors.push(`Invalid category: "${item.category}"`);
            }
          }

          let validYear = null;
          if (!item.year) {
            errors.push("Year is required");
          } else {
            const yearNum = parseInt(item.year);
            const currentYear = new Date().getFullYear();
            if (isNaN(yearNum)) {
              errors.push(`Invalid year format: "${item.year}"`);
            } else if (yearNum < 1900 || yearNum > currentYear + 5) {
              errors.push(`Year must be between 1900 and ${currentYear + 5}`);
            } else {
              validYear = yearNum;
            }
          }

          return {
            original: item,
            title: item.title?.trim() || "",
            authors: item.authors?.trim() || "",
            category: item.category?.trim() || "",
            categoryId: validCategory?.id || null,
            year: validYear,
            abstract: item.abstract?.trim() || "",
            keywords: item.keywords?.trim() || "",
            valid: errors.length === 0,
            errors: errors,
            warnings: [],
            rowNumber: index + 2,
          };
        });
      } else {
        // Excel files - show message that CSV is recommended
        setFileError(
          "For Excel files, please convert to CSV format first for best results. You can download our CSV template.",
        );
        setFile(null);
        setParsing(false);
        return;
      }

      // Calculate statistics
      const total = parsedData.length;
      const valid = parsedData.filter((r) => r.valid).length;
      const invalid = total - valid;

      // Get unique columns from first valid record
      const columns = [
        "title",
        "authors",
        "category",
        "year",
        "abstract",
        "keywords",
      ];

      setImportPreview({
        total,
        valid,
        invalid,
        columns,
        records: parsedData,
        sample: parsedData.slice(0, 5), // Show first 5 records as sample
      });

      if (invalid > 0) {
        toast.error(
          `${invalid} record(s) have validation errors. Please fix them before importing.`,
        );
      } else {
        toast.success(`All ${valid} records are valid and ready to import!`);
      }
    } catch (error) {
      console.error("Parse error:", error);
      setFileError(`Failed to parse file: ${error.message}`);
      setImportPreview(null);
    } finally {
      setParsing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setImportPreview(null);
    setFileError("");
  };

  const downloadTemplate = () => {
    // Helper function to escape CSV fields
    const escapeCSV = (field) => {
      if (field === undefined || field === null) return "";
      const stringField = String(field);
      if (
        stringField.includes(",") ||
        stringField.includes('"') ||
        stringField.includes("\n")
      ) {
        const escaped = stringField.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return stringField;
    };

    const headers = [
      "title",
      "authors",
      "category",
      "year",
      "abstract",
      "keywords",
    ];

    const sampleRows = [
      [
        "E-Learning Platform Usability Study for Remote Education",
        "Dela Cruz, J., Santos, M.",
        "CAPSTONE",
        "2024",
        "This study evaluates the usability of e-learning platforms for remote education.",
        "e-learning, usability, remote education",
      ],
      [
        "Financial Management Practices of Small Enterprises",
        "Reyes, A., Gomez, L.",
        "BUSINESS RESEARCH",
        "2023",
        "An analysis of financial management practices in small enterprises.",
        "financial management, small enterprises, SME",
      ],
      [
        "Impact of Social Media on Student Academic Performance",
        "Mendoza, C.",
        "ACTION RESEARCH",
        "2024",
        "This research examines the relationship between social media usage and academic performance.",
        "social media, academic performance, students",
      ],
    ];

    const csvRows = [
      headers.join(","),
      ...sampleRows.map((row) => row.map((cell) => escapeCSV(cell)).join(",")),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_research_import_template.csv";
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

    if (!importPreview || importPreview.valid === 0) {
      toast.error("No valid records to import");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(
      `Importing ${importPreview.valid} research papers...`,
    );

    try {
      const validRecords = importPreview.records.filter((r) => r.valid);
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      // Process each valid record
      for (const record of validRecords) {
        try {
          // Parse authors from comma-separated string to array
          const authorsArray = record.authors
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a.length > 0);

          const researchData = {
            title: record.title,
            authors: authorsArray,
            categoryId: record.categoryId,
            year: record.year,
            abstract: record.abstract || null,
            keywords: record.keywords
              ? record.keywords.split(",").map((k) => k.trim())
              : [],
          };

          const { research, error } =
            await studentResearchService.createResearch(researchData, null);

          if (error) {
            errorCount++;
            errors.push({ title: record.title, error });
          } else {
            successCount++;
          }
        } catch (err) {
          errorCount++;
          errors.push({ title: record.title, error: err.message });
        }
      }

      toast.dismiss(loadingToast);

      if (successCount > 0) {
        toast.success(
          `Successfully imported ${successCount} research papers${errorCount > 0 ? `, ${errorCount} failed` : ""}`,
        );
      } else {
        toast.error(
          `Failed to import research papers. ${errors[0]?.error || "Unknown error"}`,
        );
      }

      if (errors.length > 0) {
        console.error("Import errors:", errors);
      }

      // Navigate back to student research list after successful import
      setTimeout(() => {
        navigate("/student-research");
      }, 2000);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import research papers");
    } finally {
      setLoading(false);
    }
  };

  const truncateFileName = (name, maxLength = 40) => {
    if (!name) return "";
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
    <div className="bg-white rounded-xl p-6">
      {/* Header with back button and title */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/student-research")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Import Student Research
          </h1>
          <p className="mt-2 text-gray-600">
            Bulk import research papers from CSV or JSON files
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Import Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload Area */}
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-blue-400 transition-colors">
            {!file ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FileUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Import Research Papers from File
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop your CSV or JSON file here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Maximum file size: 10MB • Supported formats: CSV, JSON
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv,.json"
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

                {parsing && (
                  <div className="flex justify-center py-8">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Parsing file...</span>
                  </div>
                )}

                {/* Import Mode Selection */}
                {!parsing && importPreview && (
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
                    </div>
                  </div>
                )}
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
          {importPreview && !parsing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                  <p className="text-xs text-gray-500 mb-1">Total Records</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {importPreview.total}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Valid Records</p>
                  <p className="text-2xl font-semibold text-green-700">
                    {importPreview.valid}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Invalid Records</p>
                  <p className="text-2xl font-semibold text-red-700">
                    {importPreview.invalid}
                  </p>
                </div>
              </div>

              {/* Sample preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Sample Preview (first {importPreview.sample.length} records):
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Row
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Title
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Authors
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Category
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Year
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.sample.map((record, index) => (
                        <tr
                          key={index}
                          className={`border-t ${record.valid ? "" : "bg-red-50"}`}
                        >
                          <td className="px-3 py-2 text-xs text-gray-500">
                            {record.rowNumber}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={!record.valid ? "text-red-600" : ""}
                            >
                              {record.title || (
                                <span className="text-red-400 italic">
                                  Missing
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {record.authors || (
                              <span className="text-red-400 italic">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.categoryId
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.category || (
                                <span className="text-red-400 italic">
                                  Missing/Invalid
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={
                                record.year ? "text-gray-700" : "text-red-600"
                              }
                            >
                              {record.year || (
                                <span className="text-red-400 italic">
                                  Missing/Invalid
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {record.valid ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div title={record.errors.join(", ")}>
                                <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importPreview.invalid > 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    Hover over the error icon to see validation details
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Import Button */}
          {file && importPreview && !parsing && (
            <div className="flex gap-4">
              <button
                onClick={handleImport}
                disabled={loading || importPreview.valid === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    <span>Import {importPreview.valid} Research Paper(s)</span>
                  </>
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
          )}
        </div>

        {/* Right Column - Instructions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Import Instructions
            </h3>

            <div className="mb-4 rounded-lg overflow-hidden bg-gray-50 p-4">
              <img
                src={instruction}
                alt="Import instructions"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=CSV+Format:+title,authors,category,year,abstract,keywords";
                }}
              />
            </div>

            <div className="space-y-4">
              {[
                {
                  n: 1,
                  title: "Download Template",
                  desc: "Use our template to ensure correct format",
                },
                {
                  n: 2,
                  title: "Prepare Your File",
                  desc: "Fill in research details following the required fields",
                },
                {
                  n: 3,
                  title: "Upload & Review",
                  desc: "Upload file and check preview for errors",
                },
                {
                  n: 4,
                  title: "Import Records",
                  desc: "Confirm import to add research to library",
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

            {/* Required Fields */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Required Fields
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>title</strong> - Research paper title
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>authors</strong> - Author names (Last Name, Initial
                    format)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>category</strong> - Research category (must match
                    existing categories)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    <strong>year</strong> - Publication year (1900-current+5)
                  </span>
                </li>
              </ul>
            </div>

            {/* Optional Fields */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Optional Fields
              </h4>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>
                    <strong>abstract</strong> - Research summary/abstract
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">•</span>
                  <span>
                    <strong>keywords</strong> - Comma-separated keywords
                  </span>
                </li>
              </ul>
            </div>

            {/* Category Options */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Valid Categories
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {loadingCategories ? (
                  <span className="text-xs text-gray-400">
                    Loading categories...
                  </span>
                ) : (
                  validCategories.slice(0, 8).map((category) => (
                    <span
                      key={category}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                    >
                      {category}
                    </span>
                  ))
                )}
                {!loadingCategories && validCategories.length > 8 && (
                  <span className="text-xs text-gray-400">
                    +{validCategories.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {/* CSV Format Example */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                CSV Format Example
              </h4>
              <code className="text-xs bg-gray-100 p-2 rounded block text-gray-700 overflow-x-auto whitespace-pre-wrap">
                title,authors,category,year,abstract,keywords
                <br />
                "E-Learning Platform Study","Dela Cruz, J., Santos,
                M.","CAPSTONE",2024,"Study abstract...","e-learning, usability"
              </code>
            </div>

            {/* Important Notes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Important Notes
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Category names are case-insensitive (e.g., "capstone" works)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Authors should be comma-separated with Last Name, Initial
                    format
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Invalid records will be skipped during import</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    PDF files are not included - add files separately after
                    import
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Download template for correct format and encoding</span>
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
  );
};

export default ImportStudentResearch;
