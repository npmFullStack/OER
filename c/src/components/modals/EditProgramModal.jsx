// src/components/modals/EditProgramModal.jsx (Updated to use real service)
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import ModalPortal from "./ModalPortal";
import { HexColorPicker } from "react-colorful";

const EditProgramModal = ({ isOpen, onClose, program, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    color: "#3b82f6",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const colorOptions = [
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Yellow" },
    { value: "#ef4444", label: "Red" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
    { value: "#6366f1", label: "Indigo" },
    { value: "#14b8a6", label: "Teal" },
    { value: "#f97316", label: "Orange" },
    { value: "#6b7280", label: "Gray" },
  ];

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || "",
        acronym: program.acronym || "",
        color: program.color || "#3b82f6",
      });
    }
  }, [program]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Program name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Program name must be at least 3 characters";
    }

    if (!formData.acronym.trim()) {
      newErrors.acronym = "Program acronym is required";
    } else if (formData.acronym.trim().length < 2) {
      newErrors.acronym = "Acronym must be at least 2 characters";
    } else if (formData.acronym.trim().length > 10) {
      newErrors.acronym = "Acronym cannot exceed 10 characters";
    }

    if (!formData.color) {
      newErrors.color = "Color is required";
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "Invalid color format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call the onUpdate prop which handles the API call
      await onUpdate(formData);
      // Modal will be closed by the parent component after successful update
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update program");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Program
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Program Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Bachelor of Science in Information Technology"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Acronym */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acronym <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="acronym"
                value={formData.acronym}
                onChange={handleChange}
                required
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase ${
                  errors.acronym ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., BSIT"
              />
              {errors.acronym && (
                <p className="mt-1 text-xs text-red-500">{errors.acronym}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Max 10 characters, will be automatically capitalized
              </p>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Color <span className="text-red-500">*</span>
              </label>

              {/* Predefined color options */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Preset Colors</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, color: color.value });
                        setShowColorPicker(false);
                        if (errors.color) {
                          setErrors((prev) => ({ ...prev, color: "" }));
                        }
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color.value
                          ? "border-gray-600 scale-110 ring-2 ring-offset-2 ring-gray-300"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Custom color picker */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Custom Color</p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`flex items-center gap-3 px-3 py-2 border rounded-lg hover:bg-gray-50 ${
                      errors.color ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span className="text-sm font-mono text-gray-600">
                      {formData.color}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, color: "#3b82f6" });
                      if (errors.color) {
                        setErrors((prev) => ({ ...prev, color: "" }));
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Reset to default
                  </button>
                </div>

                {showColorPicker && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-lg">
                    <HexColorPicker
                      color={formData.color}
                      onChange={(color) => {
                        setFormData({ ...formData, color });
                        if (errors.color) {
                          setErrors((prev) => ({ ...prev, color: "" }));
                        }
                      }}
                    />
                  </div>
                )}
                {errors.color && (
                  <p className="mt-1 text-xs text-red-500">{errors.color}</p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div
                className="w-full rounded-lg p-4 text-white transition-all"
                style={{ backgroundColor: formData.color }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">
                    {formData.acronym || "ACRONYM"}
                  </div>
                  <div className="text-sm opacity-90">
                    {formData.name || "Program Name"}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t border-gray-200 -mx-4 px-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default EditProgramModal;
