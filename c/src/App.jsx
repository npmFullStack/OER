// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UploadEbook from "@/pages/UploadEbook";
import UpdateEbook from "@/pages/UpdateEbook";
import Ebooks from "@/pages/Ebooks";
import Books from "@/pages/Books";
import NewBook from "@/pages/NewBook";
import ImportBooks from "@/pages/ImportBooks";
import Users from "@/pages/Users";
import SearchResults from "@/pages/SearchResults";
import EbookDetails from "@/pages/EbookDetails";
import EbookRecord from "@/pages/EbookRecord";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import Programs from "@/pages/Programs";
import AddProgram from "@/pages/AddProgram";
import AllResources from "@/pages/AllResources";
import EbooksByProgram from "@/pages/EbooksByProgram";
import ProgramDetails from "@/pages/ProgramDetails";
import StudentResearch from "@/pages/StudentResearch";
import UploadStudentResearch from "@/pages/UploadStudentResearch";
import EditStudentResearch from "@/pages/EditStudentResearch";
import ImportStudentResearch from "@/pages/ImportStudentResearch";

const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
          },
          success: {
            duration: 3000,
            style: {
              background: "#22c55e",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#22c55e",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/ebook/:id" element={<EbookDetails />} />
        <Route path="/browse" element={<AllResources />} />
        <Route
          path="/program/:programId/ebooks"
          element={<EbooksByProgram />}
        />

        {/* Protected routes - accessible by both superadmin and admin */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadEbook />} />
          <Route path="/ebook/update/:id" element={<UpdateEbook />} />
          <Route path="/my-ebooks" element={<Ebooks />} />

          {/* Book Management Routes */}
          <Route path="/books" element={<Books />} />
          <Route path="/books/new" element={<NewBook />} />
          <Route path="/books/import" element={<ImportBooks />} />

          {/* Student Research Routes */}
          <Route path="/student-research" element={<StudentResearch />} />
          <Route
            path="/student-research/upload"
            element={<UploadStudentResearch />}
          />
          <Route
            path="/student-research/edit/:id"
            element={<EditStudentResearch />}
          />
          <Route
            path="/student-research/import"
            element={<ImportStudentResearch />}
          />

          <Route path="/ebook-record/:id" element={<EbookRecord />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/add" element={<AddProgram />} />
          <Route path="/programs/edit/:id" element={<AddProgram />} />
          <Route path="/program/:id" element={<ProgramDetails />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route
            path="/notifications"
            element={<div>Notifications Page</div>}
          />

          {/* Users route - ONLY accessible by superadmin */}
          <Route
            path="/users"
            element={
              <RoleGuard allowedRoles={["superadmin"]}>
                <Users />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
