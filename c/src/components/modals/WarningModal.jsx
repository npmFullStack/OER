// src/components/modals/WarningModal.jsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";

const WarningModal = ({ isOpen, onClose, onConfirm, bookTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Confirm Delete
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this book?
            </p>
            {bookTitle && (
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">
                "{bookTitle}"
              </p>
            )}
            <p className="text-sm text-red-600 mt-3">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
