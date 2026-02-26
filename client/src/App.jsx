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

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadEbook />} />
            <Route path="/my-ebooks" element={<Ebooks />} />
            <Route path="/my-courses" element={<div>Courses Page</div>} />
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
