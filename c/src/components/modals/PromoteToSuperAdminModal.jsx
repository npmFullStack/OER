// src/components/modals/PromoteToSuperAdminModal.jsx
import React from "react";
import { X } from "lucide-react";
import ModalPortal from "./ModalPortal";

const PromoteToSuperAdminModal = ({
  isOpen,
  onClose,
  onConfirm,
  adminName,
  adminEmail,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Promote to Super Admin
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
          <div className="p-4 space-y-4">
            <div className="mb-2">
              <p className="text-gray-700">
                Are you sure you want to promote{" "}
                <span className="font-semibold text-gray-900">{adminName}</span>{" "}
                to Super Admin?
              </p>
              <p className="text-sm text-gray-500 mt-1">{adminEmail}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Super Admin permissions:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>Full system access and control</li>
                    <li>Ability to promote/demote other admins</li>
                    <li>Access to all settings and configurations</li>
                    <li>Can manage all users and permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              This action will grant {adminName} full administrative privileges.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 pt-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
            >
              Promote to Super Admin
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default PromoteToSuperAdminModal;
