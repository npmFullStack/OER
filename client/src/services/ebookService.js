// src/services/ebookService.js
import api from "./api";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

// Helper to normalize ebook URLs so cover_url and file_url are always absolute
const normalizeEbook = (ebook) => ({
  ...ebook,
  cover_url: ebook.cover_url
    ? ebook.cover_url.startsWith("http")
      ? ebook.cover_url
      : `${BASE_URL}${ebook.cover_url}`
    : null,
  file_url: ebook.file_url
    ? ebook.file_url.startsWith("http")
      ? ebook.file_url
      : `${BASE_URL}${ebook.file_url}`
    : null,
});

const normalizeResponse = (data) => {
  const books = Array.isArray(data) ? data : data.data || [];
  return Array.isArray(books)
    ? books.map(normalizeEbook)
    : normalizeEbook(books);
};

export const ebookService = {
  // Upload ebook
  uploadEbook: async (formData) => {
    const response = await api.post("/ebooks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // Normalize the returned ebook inside response.data.data.ebook
    const data = response.data;
    if (data?.data?.ebook) {
      data.data.ebook = normalizeEbook(data.data.ebook);
    }
    return data;
  },

  // Get all ebooks
  getEbooks: async () => {
    const response = await api.get("/ebooks");
    const raw = response.data;
    // Return same shape but with normalized URLs
    return {
      ...raw,
      data: normalizeResponse(raw),
    };
  },

  // Get user's ebooks
  getMyEbooks: async () => {
    const response = await api.get("/ebooks/my-ebooks");
    const raw = response.data;
    return {
      ...raw,
      data: normalizeResponse(raw),
    };
  },

  // Get single ebook
  getEbook: async (id) => {
    const response = await api.get(`/ebooks/${id}`);
    const raw = response.data;
    return {
      ...raw,
      data: raw.data ? normalizeEbook(raw.data) : null,
    };
  },

  // Download ebook
  downloadEbook: async (id) => {
    const response = await api.get(`/ebooks/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Delete ebook
  deleteEbook: async (id) => {
    const response = await api.delete(`/ebooks/${id}`);
    return response.data;
  },
};
