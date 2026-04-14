// src/pages/NewBook.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, User, BookMarked, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import Select from "../components/Select";

const NewBook = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    call_number: "",
    program: "BSIT",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.author ||
      !formData.call_number ||
      !formData.program
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Add New Book Record
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book Details Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
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
      </div>
    </div>
  );
};

export default NewBook;
