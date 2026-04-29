// src/components/BooksTab.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, X, MapPin, BookOpen } from "lucide-react";
import Pagination from "./Pagination";

const getProgramColor = (program) => {
  const colors = {
    BSIT: "bg-red-100 text-red-700",
    "BSBA-FM": "bg-yellow-100 text-yellow-700",
    "BSBA-MM": "bg-yellow-100 text-yellow-700",
    BSED: "bg-blue-100 text-blue-700",
    BEED: "bg-blue-100 text-blue-700",
    "GEN ED": "bg-green-100 text-green-700",
  };
  return colors[program] || "bg-gray-100 text-gray-700";
};

const getShelfLocationColor = () => "bg-blue-600 text-white";

const BooksTab = ({ books, loading }) => {
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [page, setPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(10);

  // Get unique programs
  const uniquePrograms = [...new Set(books.map((b) => b.program))];

  // Apply filters
  useEffect(() => {
    let filtered = [...books];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.call_number?.toLowerCase().includes(q) ||
          b.program?.toLowerCase().includes(q),
      );
    }

    if (selectedProgram) {
      filtered = filtered.filter((b) => b.program === selectedProgram);
    }

    setFilteredBooks(filtered);
    setPage(1);
  }, [books, search, selectedProgram]);

  const BOOK_PER_PAGE = booksPerPage;
  const startIdx = (page - 1) * BOOK_PER_PAGE;
  const currentItems = filteredBooks.slice(startIdx, startIdx + BOOK_PER_PAGE);
  const totalPages = Math.ceil(filteredBooks.length / BOOK_PER_PAGE);

  const activeFilters = [search, selectedProgram].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setSelectedProgram("");
  };

  const handleBooksPerPageChange = (e) => {
    const value = e.target.value;
    setBooksPerPage(
      value === "all" ? filteredBooks.length : parseInt(value, 10),
    );
    setPage(1);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Books Found
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Try adjusting your search or filters
        </p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors text-sm"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, call number, or program..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 transition-colors relative ${
            showFilters || activeFilters > 0
              ? "border-primary text-primary bg-primary/5"
              : "border-gray-300 text-gray-600 hover:border-gray-400"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Filter Books</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">All Programs</option>
                {uniquePrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results summary with Rows Per Page Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-600">
          Showing {startIdx + 1}–
          {Math.min(startIdx + BOOK_PER_PAGE, filteredBooks.length)} of{" "}
          {filteredBooks.length} books
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={booksPerPage === filteredBooks.length ? "all" : booksPerPage}
            onChange={handleBooksPerPageChange}
            className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white cursor-pointer"
          >
            <option value={5}>5 records</option>
            <option value={10}>10 records</option>
            <option value={20}>20 records</option>
            <option value={50}>50 records</option>
            <option value="all">All records</option>
          </select>
        </div>
      </div>

      {/* Books list */}
      <div className="space-y-3">
        {currentItems.map((book) => {
          const programBadgeClass = getProgramColor(book.program);
          return (
            <div
              key={book.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`${programBadgeClass} text-xs font-semibold px-2 py-0.5 rounded-full`}
                      >
                        {book.program}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Library Book
                      </span>
                    </div>
                    <h3 className="font-semibold text-textPrimary mb-1 text-base md:text-lg">
                      {book.title}
                    </h3>
                    <p className="text-sm text-textSecondary mb-1">
                      {book.author}
                    </p>
                    <p className="text-xs text-textSecondary font-mono">
                      Call No: {book.call_number}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getShelfLocationColor()}`}
                      >
                        {book.shelf_location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && booksPerPage !== filteredBooks.length && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default BooksTab;
