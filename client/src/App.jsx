// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UploadEbook from "@/pages/UploadEbook";
import Ebooks from "@/pages/Ebooks";
import SearchResults from "@/pages/SearchResults";
import EbookDetails from "@/pages/EbookDetails";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import Programs from "@/pages/Programs";
import AddProgram from "@/pages/AddProgram";
import AllEbooks from "@/pages/AllEbooks";
import EbooksByProgram from "@/pages/EbooksByProgram";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              iconTheme: {
                primary: "#0e326c",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/ebook/:id" element={<EbookDetails />} />
          <Route path="/browse" element={<AllEbooks />} />
          <Route
            path="/program/:programId/ebooks"
            element={<EbooksByProgram />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadEbook />} />
            <Route path="/my-ebooks" element={<Ebooks />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/add" element={<AddProgram />} />
            <Route path="/programs/edit/:id" element={<AddProgram />} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route
              path="/notifications"
              element={<div>Notifications Page</div>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
