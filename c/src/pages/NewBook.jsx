// src/pages/NewBook.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BookOpen,
  BookMarked,
  Save,
  X,
  MapPin,
  Info,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import Select from "@/components/Select";
import instruction from "@/assets/images/instruction.png";

const NewBook = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    call_number: "",
    program: "BSIT",
    shelf_location: "", // New field
  });

  const [loading, setLoading] = useState(false);

  // Program options
  const programOptions = [
    "BSIT",
    "BSBA-FM",
    "BSBA-MM",
    "BSED",
    "BEED",
    "GEN ED",
  ];

  // Shelf location options
  const shelfLocationOptions = [
    "Aisle 1 - Left",
    "Aisle 1 - Right",
    "Aisle 2 - Left",
    "Aisle 2 - Right",
    "Aisle 3 - Left",
    "Aisle 3 - Right",
    "Reference Section",
    "Reserve Section",
    "Periodical Section",
    "Multimedia Section",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProgramChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      program: value,
    }));
  };

  const handleShelfLocationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      shelf_location: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.author ||
      !formData.call_number ||
      !formData.program ||
      !formData.shelf_location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Creating book record...");

    try {
      // TODO: Replace with actual API call
      // const response = await bookService.createBook(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.dismiss(loadingToast);
      toast.success("Book record created successfully");

      // Navigate back to books list
      setTimeout(() => {
        navigate("/books");
      }, 1500);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error creating book:", error);
      toast.error(
        error.response?.data?.message || "Failed to create book record",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header with back button and title */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/books")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
          <p className="mt-2 text-gray-600">
            Create a new book record for the library catalog
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Book Information
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Book title"
                    />
                  </div>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author(s) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="e.g., John Smith, Jane Doe"
                    />
                  </div>
                </div>

                {/* Call Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="call_number"
                      value={formData.call_number}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="e.g., CS 101 .S65 2024"
                    />
                  </div>
                </div>

                {/* Program - Using Custom Select Component */}
                <Select
                  label="Program"
                  options={programOptions}
                  value={formData.program}
                  onChange={handleProgramChange}
                  placeholder="Select a program"
                  required={true}
                />

                {/* Shelf Location - New Field */}
                <Select
                  label="Shelf Location"
                  options={shelfLocationOptions}
                  value={formData.shelf_location}
                  onChange={handleShelfLocationChange}
                  placeholder="Select shelf location"
                  required={true}
                  icon={<MapPin className="w-5 h-5 text-gray-400" />}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Book Record</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/books")}
                className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all inline-flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Instructions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Instructions
            </h3>

            <div className="mb-4 rounded-lg overflow-hidden bg-gray-50 p-4">
              <img
                src={instruction}
                alt="Book creation instructions"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Instruction+Guide";
                }}
              />
            </div>

            <div className="space-y-4">
              {[
                {
                  n: 1,
                  title: "Fill Book Details",
                  desc: "Enter title, author, and call number",
                },
                {
                  n: 2,
                  title: "Select Program",
                  desc: "Choose the program this book belongs to",
                },
                {
                  n: 3,
                  title: "Assign Shelf Location",
                  desc: "Select where the book is physically located",
                },
                {
                  n: 4,
                  title: "Save Record",
                  desc: "Click save to add the book to catalog",
                },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    {n}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Use proper call number format for easy searching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Include all authors for multi-author books</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>
                    Double-check shelf location for accurate inventory
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBook;
