// src/components/modals/EditUserRoleModal.jsx
import React, { useState } from "react";
import ModalPortal from "./ModalPortal";

const EditUserRoleModal = ({ isOpen, onClose, admin, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!admin) return null;

  const isCurrentlySuperAdmin = admin.role === "super_admin";
  const newRole = isCurrentlySuperAdmin ? "admin" : "super_admin";
  const actionText = isCurrentlySuperAdmin
    ? "Remove Super Admin"
    : "Set as Super Admin";
  const newRoleText = isCurrentlySuperAdmin ? "Admin" : "Super Admin";

  const handleConfirm = () => {
    setIsConfirming(true);
    // Simulate async operation
    setTimeout(() => {
      onConfirm(newRole);
      setIsConfirming(false);
    }, 500);
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
          {/* Header - No icons, simple */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {actionText}
            </h2>
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
          <div className="p-4 space-y-4">
            <p className="text-gray-700">
              Are you sure you want to {actionText.toLowerCase()}{" "}
              <span className="font-semibold text-gray-900">
                {admin.firstName} {admin.lastName}
              </span>
              ?
            </p>

            {/* Warning Message */}
            {!isCurrentlySuperAdmin ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Warning:</span> Setting this
                  user as a Super Admin will grant them full system access,
                  including the ability to:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Manage books, e-books, and programs</li>
                  <li>Add, edit, or remove other admin users</li>
                  <li>Modify system settings and configurations</li>
                  <li>Access all areas of the admin dashboard</li>
                </ul>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Note:</span> Removing Super
                  Admin status will demote this user to a regular Admin. They
                  will:
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>No longer be able to modify other admin users</li>
                  <li>Have limited access to system settings</li>
                  <li>
                    Retain access to books, e-books, and programs management
                  </li>
                </ul>
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
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                isCurrentlySuperAdmin
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                actionText
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditUserRoleModal;
