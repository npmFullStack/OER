// src/components/modals/WarningModal.jsx
import React, { useState } from "react";
import ModalPortal from "./ModalPortal";

const WarningModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ModalPortal isOpen={isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              disabled={isConfirming}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <p className="text-gray-700">{message}</p>
            {!isDanger && title === "Unrestrict User" && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-800">
                  <span className="font-medium">✓ Notification:</span> The user
                  will receive an email notification about their account being
                  reactivated.
                </p>
              </div>
            )}
            {isDanger && title === "Restrict User" && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-xs text-orange-800">
                  <span className="font-medium">⚠️ Notification:</span> The user
                  will receive an email notification about their account being
                  restricted.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDanger
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default WarningModal;
