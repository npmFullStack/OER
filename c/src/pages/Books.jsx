// src/pages/Books.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  FileUp,
} from "lucide-react";

const Books = () => {
  const navigate = useNavigate();

  const [books] = useState([
    {
      id: 1,
      accession_number: "ACC-2024-001",
      title: "Introduction to Computer Science",
      author: "John Smith, Jane Doe",
      call_number: "CS 101 .S65 2024",
      publisher: "Pearson Education",
      copyright: 2024,
      isbn: "978-0-13-789456-1",
      status: "Available",
      date_added: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      accession_number: "ACC-2024-002",
      title: "Data Structures and Algorithms",
      author: "Robert Johnson",
      call_number: "CS 201 .J64 2023",
      publisher: "MIT Press",
      copyright: 2023,
      isbn: "978-0-26-204789-2",
      status: "Borrowed",
      date_added: "2024-01-10T14:20:00Z",
    },
    {
      id: 3,
      accession_number: "ACC-2024-003",
      title: "Modern Web Development",
      author: "Sarah Williams, Michael Brown",
      call_number: "WEB 301 .W55 2024",
      publisher: "O'Reilly Media",
      copyright: 2024,
      isbn: "978-1-49-207845-6",
      status: "Available",
      date_added: "2024-01-05T09:15:00Z",
    },
    {
      id: 4,
      accession_number: "ACC-2024-004",
      title: "Database Management Systems",
      author: "David Chen",
      call_number: "DB 401 .C44 2023",
      publisher: "McGraw-Hill",
      copyright: 2023,
      isbn: "978-1-26-045876-3",
      status: "Available",
      date_added: "2024-01-12T11:45:00Z",
    },
    {
      id: 5,
      accession_number: "ACC-2024-005",
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell, Peter Norvig",
      call_number: "AI 501 .R87 2024",
      publisher: "Prentice Hall",
      copyright: 2024,
      isbn: "978-0-13-461099-3",
      status: "On Hold",
      date_added: "2024-01-18T16:30:00Z",
    },
  ]);

  const [filteredBooks, setFilteredBooks] = useState(books);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Borrowed", label: "Borrowed" },
    { value: "On Hold", label: "On Hold" },
    { value: "Lost", label: "Lost" },
    { value: "Damaged", label: "Damaged" },
  ];

  useEffect(() => {
    let filtered = [...books];

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.accession_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          book.isbn?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((book) => book.status === statusFilter);
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, books]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const activeFilterCount = [searchTerm, statusFilter].filter(Boolean).length;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Borrowed":
        return "bg-yellow-100 text-yellow-800";
      case "On Hold":
        return "bg-blue-100 text-blue-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      case "Damaged":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Collection</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize library books with accession numbers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={() => navigate("/books/import")}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <FileUp className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => navigate("/books/new")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Record
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, accession #, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 text-sm border rounded-lg flex items-center gap-1.5 transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative">
                <BookOpen className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Showing {currentItems.length} of {filteredBooks.length} books
        </div>
      </div>

      {/* Books Table */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Books Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter
              ? "Try adjusting your filters"
              : "Start by adding your first book record"}
          </p>
          <button
            onClick={() => navigate("/books/new")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Record
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Accession #
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Call Number
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Publisher
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Copyright
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((book) => (
                  <tr
                    key={book.id}
                    onClick={() =>
                      navigate(`/books/${book.id}`, { state: { book } })
                    }
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {book.accession_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {book.author}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {book.call_number}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {book.publisher}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {book.copyright}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(book.date_added)}
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
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2)
                    pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default Books;
