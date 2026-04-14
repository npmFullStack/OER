// src/pages/ProgramDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  BookOpen,
  AlertCircle,
  MoreVertical,
  FileText,
  Library,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "@/components/Select";
import Pagination from "@/components/Pagination";
import StatCard from "@/components/StatCard";
import EbookCard from "@/components/EbookCard";
import EditProgramModal from "@/components/modals/EditProgramModal";
import EditBookModal from "@/components/modals/EditBookModal";
import WarningModal from "@/components/modals/WarningModal";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PROGRAMS = [
  {
    id: 1,
    name: "Bachelor of Science in Information Technology",
    acronym: "BSIT",
    color: "#3b82f6",
    created_at: "2023-01-15T08:00:00Z",
  },
  {
    id: 2,
    name: "Bachelor of Science in Computer Science",
    acronym: "BSCS",
    color: "#10b981",
    created_at: "2023-02-20T08:00:00Z",
  },
  {
    id: 3,
    name: "Bachelor of Science in Computer Engineering",
    acronym: "BSCpE",
    color: "#f59e0b",
    created_at: "2023-03-10T08:00:00Z",
  },
  {
    id: 4,
    name: "Bachelor of Science in Electronics Engineering",
    acronym: "BSECE",
    color: "#8b5cf6",
    created_at: "2023-04-05T08:00:00Z",
  },
  {
    id: 5,
    name: "Bachelor of Science in Electrical Engineering",
    acronym: "BSEE",
    color: "#ef4444",
    created_at: "2023-05-12T08:00:00Z",
  },
  {
    id: 6,
    name: "Bachelor of Science in Mechanical Engineering",
    acronym: "BSME",
    color: "#06b6d4",
    created_at: "2023-06-18T08:00:00Z",
  },
];

const ALL_EBOOKS = [
  {
    id: "1",
    program_id: "1",
    title: "Introduction to Programming",
    file_name: "intro-programming.pdf",
    file_size: 2048000,
    file_url: "#",
    cover_url: null,
    downloads: 342,
    year_level: 1,
    created_at: "2024-01-10T08:00:00Z",
    uploader_name: "Prof. Santos",
  },
  {
    id: "2",
    program_id: "1",
    title: "Data Structures and Algorithms",
    file_name: "dsa.pdf",
    file_size: 3145728,
    file_url: "#",
    cover_url: null,
    downloads: 289,
    year_level: 2,
    created_at: "2024-01-15T08:00:00Z",
    uploader_name: "Prof. Reyes",
  },
  {
    id: "3",
    program_id: "1",
    title: "Database Management Systems",
    file_name: "dbms.pdf",
    file_size: 4194304,
    file_url: "#",
    cover_url: null,
    downloads: 412,
    year_level: 2,
    created_at: "2024-02-01T08:00:00Z",
    uploader_name: "Prof. Lim",
  },
  {
    id: "4",
    program_id: "2",
    title: "Discrete Mathematics",
    file_name: "discrete-math.pdf",
    file_size: 5242880,
    file_url: "#",
    cover_url: null,
    downloads: 198,
    year_level: 1,
    created_at: "2024-01-20T08:00:00Z",
    uploader_name: "Prof. Garcia",
  },
  {
    id: "5",
    program_id: "2",
    title: "Operating Systems Concepts",
    file_name: "os-concepts.pdf",
    file_size: 6291456,
    file_url: "#",
    cover_url: null,
    downloads: 321,
    year_level: 3,
    created_at: "2024-02-10T08:00:00Z",
    uploader_name: "Prof. Cruz",
  },
  {
    id: "6",
    program_id: "3",
    title: "Digital Logic Design",
    file_name: "digital-logic.pdf",
    file_size: 3670016,
    file_url: "#",
    cover_url: null,
    downloads: 156,
    year_level: 1,
    created_at: "2024-03-01T08:00:00Z",
    uploader_name: "Prof. Torres",
  },
  {
    id: "7",
    program_id: "3",
    title: "Microprocessors and Microcontrollers",
    file_name: "microprocessors.pdf",
    file_size: 4718592,
    file_url: "#",
    cover_url: null,
    downloads: 234,
    year_level: 3,
    created_at: "2024-03-15T08:00:00Z",
    uploader_name: "Prof. Navarro",
  },
  {
    id: "8",
    program_id: "1",
    title: "Web Development Fundamentals",
    file_name: "web-dev.pdf",
    file_size: 2621440,
    file_url: "#",
    cover_url: null,
    downloads: 567,
    year_level: 2,
    created_at: "2024-04-01T08:00:00Z",
    uploader_name: "Prof. Santos",
  },
  {
    id: "9",
    program_id: "2",
    title: "Artificial Intelligence",
    file_name: "ai-fundamentals.pdf",
    file_size: 7340032,
    file_url: "#",
    cover_url: null,
    downloads: 445,
    year_level: 4,
    created_at: "2024-04-15T08:00:00Z",
    uploader_name: "Prof. Reyes",
  },
  {
    id: "10",
    program_id: "4",
    title: "Electronic Circuits Analysis",
    file_name: "circuits.pdf",
    file_size: 5767168,
    file_url: "#",
    cover_url: null,
    downloads: 123,
    year_level: 2,
    created_at: "2024-05-01T08:00:00Z",
    uploader_name: "Prof. Dela Cruz",
  },
  {
    id: "11",
    program_id: "1",
    title: "Software Engineering",
    file_name: "software-eng.pdf",
    file_size: 3932160,
    file_url: "#",
    cover_url: null,
    downloads: 378,
    year_level: 3,
    created_at: "2024-05-10T08:00:00Z",
    uploader_name: "Prof. Lim",
  },
  {
    id: "12",
    program_id: "2",
    title: "Machine Learning Basics",
    file_name: "ml-basics.pdf",
    file_size: 8388608,
    file_url: "#",
    cover_url: null,
    downloads: 512,
    year_level: 4,
    created_at: "2024-05-20T08:00:00Z",
    uploader_name: "Prof. Garcia",
  },
];

const ALL_BOOKS = [
  {
    id: "1",
    program_id: "1",
    title: "Introduction to Computer Science",
    author: "John Smith, Jane Doe",
    call_number: "CS 101 .S65 2024",
    isbn: "978-0-13-123456-7",
    year: 2024,
    program: "BSIT",
  },
  {
    id: "2",
    program_id: "1",
    title: "Data Structures and Algorithms",
    author: "Robert Johnson",
    call_number: "CS 201 .J64 2023",
    isbn: "978-0-13-234567-8",
    year: 2023,
    program: "BSIT",
  },
  {
    id: "3",
    program_id: "2",
    title: "Modern Web Development",
    author: "Sarah Williams, Michael Brown",
    call_number: "WEB 301 .W55 2024",
    isbn: "978-0-13-345678-9",
    year: 2024,
    program: "BSCS",
  },
  {
    id: "4",
    program_id: "1",
    title: "Database Management Systems",
    author: "David Chen",
    call_number: "DB 401 .C44 2023",
    isbn: "978-0-13-456789-0",
    year: 2023,
    program: "BSIT",
  },
  {
    id: "5",
    program_id: "2",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    call_number: "AI 501 .R87 2024",
    isbn: "978-0-13-567890-1",
    year: 2024,
    program: "BSCS",
  },
  {
    id: "6",
    program_id: "3",
    title: "Computer Organization and Design",
    author: "David Patterson, John Hennessy",
    call_number: "CO 301 .P38 2023",
    isbn: "978-0-12-678912-3",
    year: 2023,
    program: "BSCpE",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const formatDownloads = (n) => {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
};

const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Program color mapping for badge styling (like program column)
const getProgramColor = (programName) => {
  const colors = {
    BSIT: "bg-red-100 text-red-800",
    BSCS: "bg-green-100 text-green-800",
    BSCpE: "bg-yellow-100 text-yellow-800",
    BSECE: "bg-purple-100 text-purple-800",
    BSEE: "bg-orange-100 text-orange-800",
    BSME: "bg-cyan-100 text-cyan-800",
  };
  return colors[programName] || "bg-gray-100 text-gray-800";
};

const ProgramDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [ebooks, setEbooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ebooks");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Modal states
  const [isEditProgramModalOpen, setIsEditProgramModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'program' or 'book'

  const itemsPerPage = 6;

  useEffect(() => {
    // Simulate async fetch from mock data
    const timer = setTimeout(() => {
      const foundProgram = PROGRAMS.find((p) => String(p.id) === String(id));
      if (foundProgram) {
        setProgram(foundProgram);
        const programEbooks = ALL_EBOOKS.filter(
          (e) => String(e.program_id) === String(id),
        ).map((ebook) => ({
          ...ebook,
          program_name: foundProgram.acronym,
        }));
        const programBooks = ALL_BOOKS.filter(
          (b) => String(b.program_id) === String(id),
        );
        setEbooks(programEbooks);
        setBooks(programBooks);
      } else {
        setError("Program not found.");
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleEditProgram = () => {
    setIsEditProgramModalOpen(true);
  };

  const handleUpdateProgram = (updatedProgram) => {
    setProgram(updatedProgram);
    setEbooks((prev) =>
      prev.map((ebook) => ({
        ...ebook,
        program_name: updatedProgram.acronym,
      })),
    );
    toast.success("Program updated successfully!");
  };

  const handleDeleteProgramClick = () => {
    setDeleteType("program");
    setItemToDelete(program);
    setIsWarningModalOpen(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setIsEditBookModalOpen(true);
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks(
      books.map((book) => (book.id === updatedBook.id ? updatedBook : book)),
    );
    toast.success("Book updated successfully!");
    setIsEditBookModalOpen(false);
    setSelectedBook(null);
  };

  const handleDeleteBookClick = (book) => {
    setDeleteType("book");
    setItemToDelete(book);
    setIsWarningModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === "program") {
      toast.success("Program deleted successfully");
      navigate("/programs");
    } else if (deleteType === "book") {
      setBooks(books.filter((b) => b.id !== itemToDelete.id));
      toast.success("Book deleted successfully");
    }
    setIsWarningModalOpen(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const handleCancelDelete = () => {
    setIsWarningModalOpen(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const handleDownload = async (ebookId, ebookTitle, fileName) => {
    const toastId = toast.loading("Preparing download...");
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Download started!", { id: toastId });
    setEbooks((prev) =>
      prev.map((ebook) =>
        ebook.id === ebookId
          ? { ...ebook, downloads: (ebook.downloads || 0) + 1 }
          : ebook,
      ),
    );
  };

  const totalEbooks = ebooks.length;
  const totalBooks = books.length;

  // Pagination for eBooks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEbooks = ebooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalEbookPages = Math.ceil(ebooks.length / itemsPerPage);

  // Pagination for Books
  const currentBooks = books.slice(indexOfFirstItem, indexOfLastItem);
  const totalBookPages = Math.ceil(books.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Action options for CustomSelect with icons
  const actionOptions = [
    {
      value: "edit",
      label: "Edit Program",
      icon: Edit2,
    },
    {
      value: "delete",
      label: "Delete Program",
      icon: Trash2,
    },
  ];

  const handleActionSelect = (selectedValue) => {
    if (selectedValue === "edit") {
      handleEditProgram();
    } else if (selectedValue === "delete") {
      handleDeleteProgramClick();
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col rounded-xl bg-white">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link
              to="/programs"
              className="hover:text-gray-900 transition-colors"
            >
              Programs
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {loading ? "Loading..." : program?.acronym || program?.name}
            </span>
          </nav>

          {/* Loading state */}
          {loading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading program details...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-50 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {error}
              </h3>
              <button
                onClick={() => navigate("/programs")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Programs
              </button>
            </div>
          )}

          {/* Program details */}
          {!loading && !error && program && (
            <>
              {/* Program Header with Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {program.name}
                      </h1>
                      {/* Single small badge next to program name */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getProgramColor(program.acronym)}`}
                      >
                        {program.acronym}
                      </span>
                    </div>
                  </div>

                  {/* Action Select Dropdown using CustomSelect */}
                  <div className="w-56">
                    <CustomSelect
                      options={actionOptions}
                      onChange={handleActionSelect}
                      placeholder="Actions"
                      isSearchable={false}
                      isClearable={false}
                    />
                  </div>
                </div>

                {/* Program Stats - Using StatCard component */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <StatCard
                    title="Total eBooks"
                    value={totalEbooks}
                    icon={BookOpen}
                    description={`${totalEbooks} educational resources`}
                  />
                  <StatCard
                    title="Total Books"
                    value={totalBooks}
                    icon={BookOpen}
                    description={`${totalBooks} physical books`}
                  />
                </div>
              </div>

              {/* Tabs with Icons */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => {
                        setActiveTab("ebooks");
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "ebooks"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      eBooks ({totalEbooks})
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("books");
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "books"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Library className="w-4 h-4" />
                      Books ({totalBooks})
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* eBooks Tab - Using EbookCard component */}
                  {activeTab === "ebooks" && (
                    <>
                      {ebooks.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gray-50 rounded-full">
                              <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No eBooks Yet
                          </h3>
                          <p className="text-gray-600">
                            This program doesn't have any eBooks uploaded yet.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentEbooks.map((ebook) => (
                              <EbookCard
                                key={ebook.id}
                                ebook={ebook}
                                onDownload={handleDownload}
                                getProgramColor={getProgramColor}
                                formatFileSize={formatFileSize}
                                formatDownloads={formatDownloads}
                              />
                            ))}
                          </div>

                          {/* Pagination for eBooks */}
                          {totalEbookPages > 1 && (
                            <div className="mt-6">
                              <Pagination
                                currentPage={currentPage}
                                totalPages={totalEbookPages}
                                onPageChange={handlePageChange}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Books Tab - Table with Actions */}
                  {activeTab === "books" && (
                    <>
                      {books.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-gray-50 rounded-full">
                              <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Books Yet
                          </h3>
                          <p className="text-gray-600">
                            This program doesn't have any books associated yet.
                          </p>
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
                                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-12">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {currentBooks.map((book) => (
                                  <tr
                                    key={book.id}
                                    className="hover:bg-gray-50 transition-colors group"
                                  >
                                    <td
                                      className="px-4 py-3 font-medium text-gray-900 cursor-pointer"
                                      onClick={() =>
                                        navigate(`/books/${book.id}`, {
                                          state: { book },
                                        })
                                      }
                                    >
                                      {book.title}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-gray-600 cursor-pointer"
                                      onClick={() =>
                                        navigate(`/books/${book.id}`, {
                                          state: { book },
                                        })
                                      }
                                    >
                                      {book.author}
                                    </td>
                                    <td
                                      className="px-4 py-3 font-mono text-xs text-gray-600 cursor-pointer"
                                      onClick={() =>
                                        navigate(`/books/${book.id}`, {
                                          state: { book },
                                        })
                                      }
                                    >
                                      {book.call_number}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(program.acronym)}`}
                                      >
                                        {program.acronym}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center relative">
                                      <button
                                        onClick={() =>
                                          setOpenActionMenu(
                                            openActionMenu === book.id
                                              ? null
                                              : book.id,
                                          )
                                        }
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Actions"
                                      >
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                      </button>

                                      {/* Dropdown Menu */}
                                      {openActionMenu === book.id && (
                                        <div className="absolute right-4 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                          <button
                                            onClick={() => {
                                              setOpenActionMenu(null);
                                              handleEditBook(book);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Book
                                          </button>
                                          <button
                                            onClick={() => {
                                              setOpenActionMenu(null);
                                              handleDeleteBookClick(book);
                                            }}
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

                          {/* Pagination for Books */}
                          {totalBookPages > 1 && (
                            <div className="mt-6">
                              <Pagination
                                currentPage={currentPage}
                                totalPages={totalBookPages}
                                onPageChange={handlePageChange}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <EditProgramModal
        isOpen={isEditProgramModalOpen}
        onClose={() => setIsEditProgramModalOpen(false)}
        program={program}
        onUpdate={handleUpdateProgram}
      />

      <EditBookModal
        isOpen={isEditBookModalOpen}
        onClose={() => {
          setIsEditBookModalOpen(false);
          setSelectedBook(null);
        }}
        book={selectedBook}
        onUpdate={handleUpdateBook}
      />

      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        bookTitle={itemToDelete?.title || itemToDelete?.name}
      />
    </div>
  );
};

export default ProgramDetails;
