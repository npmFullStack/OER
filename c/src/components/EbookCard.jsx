// src/components/EbookCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Download, Eye, Library } from "lucide-react";
import toast from "react-hot-toast";

const EbookCard = ({
  ebook,
  onDownload,
  getProgramColor,
  formatDate,
  formatFileSize,
  formatDownloads,
}) => {
  const navigate = useNavigate();

  const handleRead = (fileUrl) => {
    if (fileUrl && fileUrl !== "#") {
      window.open(fileUrl, "_blank");
    } else {
      toast.error("PDF not available in demo mode");
    }
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownload(ebook.id, ebook.title, ebook.file_name);
  };

  const handleCardClick = () => {
    navigate(`/ebook-record/${ebook.id}`);
  };

  const handleReadClick = (e) => {
    e.stopPropagation();
    handleRead(ebook.file_url);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group overflow-hidden hover:-translate-y-2 transition-all duration-300 h-full bg-white rounded-xl border border-gray-200 cursor-pointer"
    >
      {/* eBook Cover - Using aspect ratio similar to featured items */}
      <div className="relative overflow-hidden">
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {ebook.cover_url ? (
            <img
              src={ebook.cover_url}
              alt={ebook.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-gray-400" />
          )}
        </div>

        {/* Program Badge - Like in Home.jsx featured items */}
        {ebook.program_name && (
          <span
            className={`absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getProgramColor(ebook.program_name)}`}
          >
            {ebook.program_name}
          </span>
        )}

        {/* Type Badge - eBook */}
        <span className="absolute top-2 right-2 bg-primary/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          eBook
        </span>
      </div>

      {/* eBook Info - Matches Home.jsx style */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-textPrimary mb-1 line-clamp-2 text-sm md:text-base group-hover:text-primary transition-colors">
          {ebook.title}
        </h3>

        <p className="text-xs md:text-sm text-textSecondary mb-2">
          Uploaded by {ebook.uploader_name || "Unknown"}
        </p>

        {/* Downloads info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-textSecondary">
            <Download className="w-3 h-3" />
            <span>{formatDownloads(ebook.downloads)} downloads</span>
          </div>
          <span className="text-xs text-textSecondary">
            {formatFileSize(ebook.file_size)}
          </span>
        </div>

        {/* Action Buttons - Styled like Home.jsx */}
        <div className="flex gap-2">
          <button
            onClick={handleReadClick}
            className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs md:text-sm font-medium text-gray-700 transition-colors"
          >
            <Eye className="w-3 h-3 md:w-4 md:h-4" />
            Read
          </button>
          <button
            onClick={handleDownloadClick}
            className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-primary hover:bg-primaryDark rounded-lg text-xs md:text-sm font-medium text-white transition-colors"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default EbookCard;
