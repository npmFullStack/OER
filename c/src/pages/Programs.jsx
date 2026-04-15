// src/pages/Programs.jsx (Updated to use real service)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Plus, Search, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import programService from "@/services/program.service";
import { useAuth } from "@/context/AuthContext";

const hexToLightBg = (hex) => {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.08)`;
  } catch {
    return "rgba(59,130,246,0.08)";
  }
};

const ProgramCard = ({ program, onEdit, onDelete }) => {
  const color = program.color || "#3b82f6";
  const lightBg = hexToLightBg(color);

  return (
    <div
      className="group rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 flex relative"
      style={{ backgroundColor: lightBg }}
    >
      {/* Left color bar */}
      <div
        className="w-1 flex-shrink-0 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      {/* Card content - clickable to program details */}
      <Link
        to={`/program/${program.id}`}
        className="flex items-center gap-4 p-4 flex-1 min-w-0"
      >
        <div style={{ color }}>
          <GraduationCap className="w-6 h-6 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm mb-0.5">
            {program.acronym}
          </h3>
          <p className="text-xs text-gray-500 truncate">{program.name}</p>
          <div className="mt-1 flex items-center gap-3">
            <p
              className="text-xs font-medium flex items-center gap-1"
              style={{ color }}
            >
              <BookOpen className="w-3 h-3" />
              {program.total_books || 0} Books
            </p>
            <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {program.total_ebooks || 0} eBooks
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

const Programs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    const result = await programService.getAllPrograms();
    if (result.programs) {
      setPrograms(result.programs);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id, programName) => {
    if (!window.confirm(`Are you sure you want to delete "${programName}"?`)) {
      return;
    }

    const result = await programService.deleteProgram(id, user?.id);
    if (result.success) {
      toast.success("Program deleted successfully");
      await fetchPrograms();
    } else {
      toast.error(result.error || "Failed to delete program");
    }
  };

  const filteredPrograms = programs.filter(
    (program) =>
      program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.acronym?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

      {/* Programs Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Programs;
