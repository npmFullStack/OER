// src/components/modals/NewStudentResearchCategory.jsx
import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import ModalPortal from "./ModalPortal";

const NewStudentResearchCategory = ({ isOpen, onClose, onSave }) => {
  const [categories, setCategories] = useState([
    { id: 1, name: "CAPSTONE", color: "#3b82f6" },
    { id: 2, name: "BUSINESS RESEARCH", color: "#10b981" },
    { id: 3, name: "FEASIBILITY STUDY", color: "#f59e0b" },
    { id: 4, name: "ACTION RESEARCH", color: "#ef4444" },
    { id: 5, name: "EXPERIMENTAL THESIS", color: "#8b5cf6" },
  ]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorOptions = [
    {
      value: "#3b82f6",
      label: "Blue",
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
    },
    {
      value: "#10b981",
      label: "Green",
      bgClass: "bg-green-100",
      textClass: "text-green-700",
    },
    {
      value: "#f59e0b",
      label: "Yellow",
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-700",
    },
    {
      value: "#ef4444",
      label: "Red",
      bgClass: "bg-red-100",
      textClass: "text-red-700",
    },
    {
      value: "#8b5cf6",
      label: "Purple",
      bgClass: "bg-purple-100",
      textClass: "text-purple-700",
    },
    {
      value: "#ec4899",
      label: "Pink",
      bgClass: "bg-pink-100",
      textClass: "text-pink-700",
    },
    {
      value: "#6366f1",
      label: "Indigo",
      bgClass: "bg-indigo-100",
      textClass: "text-indigo-700",
    },
    {
      value: "#14b8a6",
      label: "Teal",
      bgClass: "bg-teal-100",
      textClass: "text-teal-700",
    },
    {
      value: "#f97316",
      label: "Orange",
      bgClass: "bg-orange-100",
      textClass: "text-orange-700",
    },
    {
      value: "#6b7280",
      label: "Gray",
      bgClass: "bg-gray-100",
      textClass: "text-gray-700",
    },
  ];

  const getColorStyle = (colorValue) => {
    const colorOption = colorOptions.find((opt) => opt.value === colorValue);
    return (
      colorOption || { bgClass: "bg-gray-100", textClass: "text-gray-700" }
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([
        ...categories,
        {
          id: Date.now(),
          name: newCategoryName.trim().toUpperCase(),
          color: selectedColor,
        },
      ]);
      setNewCategoryName("");
      setSelectedColor("#3b82f6");
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter((category) => category.id !== id));
  };

  const handleSave = () => {
    const categoryData = categories.map((cat) => ({
      name: cat.name,
      color: cat.color,
    }));
    if (onSave) {
      onSave(categoryData);
    }
    onClose();
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Research Categories
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Add New Category Form */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Add New Category
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Category name (e.g., LITERATURE REVIEW)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase"
              />

              {/* Color Selection */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Choose Category Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.value
                          ? "border-gray-600 scale-110 ring-2 ring-offset-2 ring-gray-300"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Preview of how it will look */}
              {newCategoryName && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getColorStyle(selectedColor).bgClass} ${getColorStyle(selectedColor).textClass}`}
                  >
                    {newCategoryName.trim().toUpperCase() || "CATEGORY NAME"}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddCategory}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Existing Categories ({categories.length})
            </h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const colorStyle = getColorStyle(category.color);
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colorStyle.bgClass} ${colorStyle.textClass}`}
                    >
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default NewStudentResearchCategory;
