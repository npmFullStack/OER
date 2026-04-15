// src/pages/Books.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  X,
  Plus,
  FileUp,
  MoreVertical,
  Edit,
  Trash2,
  MapPin,
  ChevronDown,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import EditBookModal from "@/components/modals/EditBookModal";
import WarningModal from "@/components/modals/WarningModal";
import NewBookShelves from "@/components/modals/NewBookShelves"; // Adjust path as needed

const Books = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([
    {
      id: 1,
      title: "Introduction to Computer Science",
      author: "John Smith, Jane Doe",
      call_number: "CS 101 .S65 2024",
      program: "BSIT",
      shelf_location: "Aisle 1 - Left",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      author: "Robert Johnson",
      call_number: "CS 201 .J64 2023",
      program: "BSIT",
      shelf_location: "Aisle 1 - Right",
    },
    {
      id: 3,
      title: "Modern Web Development",
      author: "Sarah Williams, Michael Brown",
      call_number: "WEB 301 .W55 2024",
      program: "BSIT",
      shelf_location: "Aisle 2 - Left",
    },
    {
      id: 4,
      title: "Database Management Systems",
      author: "David Chen",
      call_number: "DB 401 .C44 2023",
      program: "BSIT",
      shelf_location: "Aisle 2 - Right",
    },
    {
      id: 5,
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell, Peter Norvig",
      call_number: "AI 501 .R87 2024",
      program: "BSIT",
      shelf_location: "Aisle 3 - Left",
    },
    {
      id: 6,
      title: "Financial Management Principles",
      author: "Robert Kiyosaki",
      call_number: "FM 101 .K59 2024",
      program: "BSBA-FM",
      shelf_location: "Aisle 3 - Right",
    },
    {
      id: 7,
      title: "Marketing Management",
      author: "Philip Kotler",
      call_number: "MM 201 .K68 2023",
      program: "BSBA-MM",
      shelf_location: "Reference Section",
    },
    {
      id: 8,
      title: "Educational Psychology",
      author: "John Dewey",
      call_number: "ED 101 .D49 2024",
      program: "BSED",
      shelf_location: "Reserve Section",
    },
    {
      id: 9,
      title: "Early Childhood Education",
      author: "Maria Montessori",
      call_number: "EC 201 .M67 2023",
      program: "BEED",
      shelf_location: "Periodical Section",
    },
    {
      id: 10,
      title: "World History",
      author: "Howard Zinn",
      call_number: "GE 101 .Z56 2024",
      program: "GEN ED",
      shelf_location: "Multimedia Section",
    },
  ]);

  const [filteredBooks, setFilteredBooks] = useState(books);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [shelfLocationFilter, setShelfLocationFilter] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isNewBookShelvesOpen, setIsNewBookShelvesOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Changed to state variable

  // Program color mapping
  const getProgramColor = (program) => {
    const colors = {
      BSIT: "bg-red-100 text-red-800",
      "BSBA-FM": "bg-yellow-100 text-yellow-800",
      "BSBA-MM": "bg-yellow-100 text-yellow-800",
      BSED: "bg-blue-100 text-blue-800",
      BEED: "bg-blue-100 text-blue-800",
      "GEN ED": "bg-green-100 text-green-800",
    };
    return colors[program] || "bg-gray-100 text-gray-800";
  };

  // Shelf location color mapping
  const getShelfLocationColor = (location) => {
    const colors = {
      "Aisle 1 - Left": "bg-purple-100 text-purple-800",
      "Aisle 1 - Right": "bg-purple-100 text-purple-800",
      "Aisle 2 - Left": "bg-indigo-100 text-indigo-800",
      "Aisle 2 - Right": "bg-indigo-100 text-indigo-800",
      "Aisle 3 - Left": "bg-pink-100 text-pink-800",
      "Aisle 3 - Right": "bg-pink-100 text-pink-800",
      "Reference Section": "bg-orange-100 text-orange-800",
      "Reserve Section": "bg-teal-100 text-teal-800",
      "Periodical Section": "bg-cyan-100 text-cyan-800",
      "Multimedia Section": "bg-emerald-100 text-emerald-800",
    };
    return colors[location] || "bg-gray-100 text-gray-800";
  };

  // Get unique programs and shelf locations for filters
  const programOptions = [...new Set(books.map((book) => book.program))];
  const shelfLocationOptions = [
    ...new Set(books.map((book) => book.shelf_location)),
  ];

  useEffect(() => {
    let filtered = [...books];

    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.call_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.shelf_location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (programFilter) {
      filtered = filtered.filter((book) => book.program === programFilter);
    }

    if (shelfLocationFilter) {
      filtered = filtered.filter(
        (book) => book.shelf_location === shelfLocationFilter,
      );
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [searchTerm, programFilter, shelfLocationFilter, books]);

  const clearFilters = () => {
    setSearchTerm("");
    setProgramFilter("");
    setShelfLocationFilter("");
  };

  const activeFilterCount = [
    searchTerm,
    programFilter,
    shelfLocationFilter,
  ].filter(Boolean).length;

  const handleEditBook = (book) => {
    setOpenActionMenu(null);
    setSelectedBook(book);
    setIsEditModalOpen(true);
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks(
      books.map((book) => (book.id === updatedBook.id ? updatedBook : book)),
    );
    setIsEditModalOpen(false);
    setSelectedBook(null);
  };

  const handleDeleteClick = (book) => {
    setOpenActionMenu(null);
    setBookToDelete(book);
    setIsWarningModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      setBooks(books.filter((b) => b.id !== bookToDelete.id));
      setIsWarningModalOpen(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsWarningModalOpen(false);
    setBookToDelete(null);
  };

  const handleAddNewBook = () => {
    setIsAddDropdownOpen(false);
    navigate("/books/new");
  };

  const handleAddNewBookShelves = () => {
    setIsAddDropdownOpen(false);
    setIsNewBookShelvesOpen(true);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const value = e.target.value;
    setItemsPerPage(
      value === "all" ? filteredBooks.length : parseInt(value, 10),
    );
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddDropdownOpen && !event.target.closest(".add-dropdown")) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddDropdownOpen]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Collection</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize library books
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

          {/* Add Button with Dropdown */}
          <div className="relative add-dropdown">
            <button
              onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isAddDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isAddDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleAddNewBook}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  New Book
                </button>
                <button
                  onClick={handleAddNewBookShelves}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  New Book Shelves
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar with Filters */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, call number, or shelf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          {/* Program Filter Select */}
          <div className="w-48">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Programs</option>
              {programOptions.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>

          {/* Shelf Location Filter Select */}
          <div className="w-56">
            <select
              value={shelfLocationFilter}
              onChange={(e) => setShelfLocationFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Shelf Locations</option>
              {shelfLocationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters and Results Count */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {programFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Program: {programFilter}
                  <button
                    onClick={() => setProgramFilter("")}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {shelfLocationFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  Shelf: {shelfLocationFilter}
                  <button
                    onClick={() => setShelfLocationFilter("")}
                    className="hover:text-green-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
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
            {searchTerm || programFilter || shelfLocationFilter
              ? "Try adjusting your filters"
              : "Start by adding your first book record"}
          </p>
          <div className="relative add-dropdown inline-block">
            <button
              onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Record
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isAddDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAddDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleAddNewBook}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  New Book
                </button>
                <button
                  onClick={handleAddNewBookShelves}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  New Book Shelves
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
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
                    Program
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Shelf Location
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-12">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td
                      className="px-4 py-3 font-medium text-gray-900 cursor-pointer"
                      onClick={() =>
                        navigate(`/books/${book.id}`, { state: { book } })
                      }
                    >
                      {book.title}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 cursor-pointer"
                      onClick={() =>
                        navigate(`/books/${book.id}`, { state: { book } })
                      }
                    >
                      {book.author}
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-gray-600 cursor-pointer"
                      onClick={() =>
                        navigate(`/books/${book.id}`, { state: { book } })
                      }
                    >
                      {book.call_number}
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() =>
                        navigate(`/books/${book.id}`, { state: { book } })
                      }
                    >
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(book.program)}`}
                      >
                        {book.program}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() =>
                        navigate(`/books/${book.id}`, { state: { book } })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShelfLocationColor(book.shelf_location)}`}
                        >
                          {book.shelf_location}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenu(
                            openActionMenu === book.id ? null : book.id,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {/* Dropdown Menu */}
                      {openActionMenu === book.id && (
                        <div className="absolute right-4 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Book
                          </button>
                          <button
                            onClick={() => handleDeleteClick(book)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Book
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section with Rows Per Page Selector */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={
                  itemsPerPage === filteredBooks.length ? "all" : itemsPerPage
                }
                onChange={handleItemsPerPageChange}
                className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value={5}>5 records</option>
                <option value={20}>20 records</option>
                <option value={100}>100 records</option>
                <option value="all">All records</option>
              </select>
            </div>

            {/* Pagination Component */}
            {itemsPerPage !== filteredBooks.length && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        book={selectedBook}
        onUpdate={handleUpdateBook}
      />

      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        bookTitle={bookToDelete?.title}
      />

      <NewBookShelves
        isOpen={isNewBookShelvesOpen}
        onClose={() => setIsNewBookShelvesOpen(false)}
      />
    </div>
  );
};

export default Books;
