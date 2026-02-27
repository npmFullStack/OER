// src/pages/Programs.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import programService from "../services/programService";

const Programs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programService.getAll();
      if (response.success) {
        setPrograms(response.data || []);
      } else {
        toast.error(response.message || "Failed to load programs");
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.acronym?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  const handleEdit = (id) => {
    navigate(`/programs/edit/${id}`);
  };

  const handleDelete = async (id, programName) => {
    if (!window.confirm(`Are you sure you want to delete "${programName}"?`)) {
      return;
    }

    try {
      const response = await programService.delete(id);
      if (response.success) {
        toast.success("Program deleted successfully");
        fetchPrograms(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to delete program");
      }
    } catch (error) {
      console.error("Error deleting program:", error);
      toast.error(error.response?.data?.message || "Failed to delete program");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Programs</h1>
          <p className="mt-2 text-gray-600">
            Manage academic programs and their color coding
          </p>
        </div>
        <button
          onClick={() => navigate("/programs/add")}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Program
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search programs by name or acronym..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Programs Added Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first academic program
          </p>
          <button
            onClick={() => navigate("/programs/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Program
          </button>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No programs found
          </h3>
          <p className="text-gray-600">
            No programs match your search criteria
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acronym
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total eBooks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: program.color }}
                        >
                          {program.acronym?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {program.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created by: {program.created_by_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {program.acronym}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: program.color }}
                        />
                        <span className="text-sm text-gray-600 font-mono">
                          {program.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                        {program.total_ebooks || 0} eBooks
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(program.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(program.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit program"
                        >
                          <Edit2 className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id, program.name)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete program"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === number
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Programs;
