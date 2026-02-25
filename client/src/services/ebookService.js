// src/services/ebookService.js
import api from "./api";

export const ebookService = {
  // Upload ebook
  uploadEbook: async (formData) => {
    const response = await api.post("/ebooks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all ebooks
  getEbooks: async () => {
    const response = await api.get("/ebooks");
    return response.data;
  },

  // Get user's ebooks
  getMyEbooks: async () => {
    const response = await api.get("/ebooks/my-ebooks");
    return response.data;
  },

  // Get single ebook
  getEbook: async (id) => {
    const response = await api.get(`/ebooks/${id}`);
    return response.data;
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
