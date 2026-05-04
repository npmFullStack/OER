import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle, Loader } from "lucide-react";
import ModalPortal from "./ModalPortal";
import studentResearchService from "@/services/student-research.service";
import toast from "react-hot-toast";

const UploadStudentResearchFile = ({
  isOpen,
  onClose,
  researchId,
  onSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
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

  const handleUpload = async () => {
    if (!file) {
      setFileError("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      // Upload file and update research
      const { research, error } = await studentResearchService.updateResearch(
        researchId,
        {}, // No other updates
        file, // Upload new file
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success("File uploaded successfully!");
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const truncateFileName = (name, maxLength = 30) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - 3 - extension.length)}...${extension}`;
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Research File
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4">
            {/* File Upload Area */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-6 hover:border-blue-400 transition-colors">
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
                    Upload the research paper PDF document
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
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-gray-500" />
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

            {/* Info Note */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                <span className="font-medium">📄 File Requirements:</span> Only
                PDF files are accepted. Maximum file size is 50MB.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default UploadStudentResearchFile;
