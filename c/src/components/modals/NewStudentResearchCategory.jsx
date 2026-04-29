// src/components/modals/NewStudentResearchCategory.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit2, Save, Eye, Loader } from "lucide-react";
import studentResearchService from "@/services/student-research.service";
import toast from "react-hot-toast";

const NewStudentResearchCategory = ({ isOpen, onClose, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  });

  const colorOptions = [
    { value: "#dc2626", label: "Red", class: "bg-red-500" },
    { value: "#10b981", label: "Green", class: "bg-green-500" },
    { value: "#eab308", label: "Yellow", class: "bg-yellow-500" },
    { value: "#3b82f6", label: "Blue", class: "bg-blue-500" },
    { value: "#8b5cf6", label: "Purple", class: "bg-purple-500" },
    { value: "#f97316", label: "Orange", class: "bg-orange-500" },
    { value: "#ec4899", label: "Pink", class: "bg-pink-500" },
    { value: "#06b6d4", label: "Cyan", class: "bg-cyan-500" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoading(true);
    const { categories: data, error } =
      await studentResearchService.getCategories(true);
    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setSaving(true);
    const { category, error } = await studentResearchService.createCategory({
      name: newCategoryName.trim(),
      description: "",
      color: "#3b82f6",
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success("Category added successfully");
      setNewCategoryName("");
      await loadCategories();
      if (onSave) onSave([...categories, category].map((c) => c.name));
    }
    setSaving(false);
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!editForm.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setSaving(true);
    const { category, error } = await studentResearchService.updateCategory(
      categoryId,
      {
        name: editForm.name.trim().toUpperCase(),
        description: editForm.description,
        color: editForm.color,
      },
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success("Category updated successfully");
      setEditingId(null);
      setEditForm({ name: "", description: "", color: "#3b82f6" });
      await loadCategories();
      if (onSave)
        onSave(
          categories.map((c) => (c.id === categoryId ? category.name : c.name)),
        );
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setSaving(true);
    const { success, error } =
      await studentResearchService.deleteCategory(categoryId);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Category deleted successfully");
      await loadCategories();
      if (onSave)
        onSave(
          categories.filter((c) => c.id !== categoryId).map((c) => c.name),
        );
    }
    setSaving(false);
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3b82f6",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "", color: "#3b82f6" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Research Categories
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add, edit, or remove student research categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Add Category Form */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter new category name (e.g., LITERARY ANALYSIS)"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              disabled={saving || !newCategoryName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Category
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Category names should be in uppercase and descriptive
          </p>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No categories yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first category using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {editingId === category.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Category name"
                          autoFocus
                        />
                        <select
                          value={editForm.color}
                          onChange={(e) =>
                            setEditForm({ ...editForm, color: e.target.value })
                          }
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {colorOptions.map((color) => (
                            <option key={color.value} value={color.value}>
                              {color.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          {saving ? (
                            <Loader className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                          {!category.is_active && (
                            <span className="text-xs text-gray-400">
                              (Inactive)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStudentResearchCategory;
