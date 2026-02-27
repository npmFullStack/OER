// src/pages/AddProgram.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GraduationCap, ArrowLeft, Save, Tag, Info } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import toast from "react-hot-toast";
import programService from "../services/programService";

const AddProgram = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    color: "#3b82f6",
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch program data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProgram();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await programService.getById(id);
      if (response.success) {
        setFormData({
          name: response.data.name || "",
          acronym: response.data.acronym || "",
          color: response.data.color || "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error fetching program:", error);
      toast.error("Failed to load program data");
      navigate("/programs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let response;
      if (isEditMode) {
        response = await programService.update(id, formData);
      } else {
        response = await programService.create(formData);
      }

      if (response.success) {
        toast.success(
          isEditMode
            ? "Program updated successfully!"
            : "Program created successfully!",
        );
        navigate("/programs");
      } else {
        toast.error(response.message || "Failed to save program");
      }
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error(error.response?.data?.message || "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  // Predefined color options
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

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/programs")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Program" : "Add New Program"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? "Update program details"
              : "Create a new academic program with color coding"}
          </p>
        </div>
      </div>

      {loading && !formData.name && isEditMode ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading program data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - 2/3 width */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Program Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Program Information
                </h2>

                <div className="space-y-6">
                  {/* Program Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="e.g., Bachelor of Science in Information Technology"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Full official name of the program
                    </p>
                  </div>

                  {/* Program Acronym */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Acronym <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="acronym"
                        value={formData.acronym}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white uppercase"
                        placeholder="e.g., BSIT"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Short code/abbreviation (max 10 characters)
                    </p>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Color <span className="text-red-500">*</span>
                    </label>

                    {/* Predefined color options */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Preset Colors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, color: color.value });
                              setShowColorPicker(false);
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
                          className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: formData.color }}
                          />
                          <span className="text-sm font-mono text-gray-600">
                            {formData.color}
                          </span>
                        </button>
                      </div>

                      {/* Color picker popup */}
                      {showColorPicker && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-lg">
                          <HexColorPicker
                            color={formData.color}
                            onChange={(color) =>
                              setFormData({ ...formData, color })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Program"
                      : "Save Program"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/programs")}
                  className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Program Preview
              </h3>

              {/* Live Preview - Rectangle with acronym and program name */}
              <div className="mb-6">
                <div
                  className="w-full rounded-lg p-6 text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  <div className="text-center">
                    {/* Acronym - large text */}
                    <div className="text-4xl font-bold mb-2">
                      {formData.acronym || "ACRONYM"}
                    </div>
                    {/* Program Name - small text */}
                    <div className="text-sm opacity-90">
                      {formData.name || "Program Name"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Tips */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Tips</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                    <span>Use the full official program name</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                    <span>
                      Acronym should be short and recognizable (e.g., BSIT,
                      BEED)
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                    <span>Choose a distinct color for easy identification</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                    <span>
                      Colors help visualize programs in charts and filters
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProgram;
