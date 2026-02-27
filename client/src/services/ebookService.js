// src/services/ebookService.js
import api from "./api";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://192.168.254.106:5000";

// Helper to normalize ebook URLs
const normalizeEbook = (ebook) => {
  if (!ebook) return ebook;

  // Extract filename from path
  const getFilename = (path) => {
    if (!path) return null;
    return path.split("/").pop() || path.split("\\").pop();
  };

  return {
    ...ebook,
    id: ebook.id,
    title: ebook.title,
    course: ebook.course,
    year_level: ebook.year_level,
    downloads: ebook.downloads || 0,
    // Construct proper URLs
    cover_url: ebook.cover_image_path
      ? `${BASE_URL}/uploads/covers/${getFilename(ebook.cover_image_path)}`
      : null,
    file_url: ebook.file_path
      ? `${BASE_URL}/uploads/ebooks/${getFilename(ebook.file_path)}`
      : null,
    uploader_name: ebook.uploader_name,
    created_at: ebook.created_at,
  };
};

const normalizeResponse = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(normalizeEbook);
  }

  if (data.data && Array.isArray(data.data)) {
    return {
      ...data,
      data: data.data.map(normalizeEbook),
    };
  }

  if (data.data && typeof data.data === "object") {
    return {
      ...data,
      data: normalizeEbook(data.data),
    };
  }

  return data;
};

export const ebookService = {
  uploadEbook: async (formData) => {
    const response = await api.post("/ebooks/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = response.data;
    if (data?.data?.ebook) {
      data.data.ebook = normalizeEbook(data.data.ebook);
    }
    return data;
  },

  getEbooks: async () => {
    const response = await api.get("/ebooks");
    return normalizeResponse(response.data);
  },

  getMyEbooks: async () => {
    const response = await api.get("/ebooks/my-ebooks");
    return normalizeResponse(response.data);
  },

  getEbook: async (id) => {
    const response = await api.get(`/ebooks/${id}`);
    return normalizeResponse(response.data);
  },

  downloadEbook: async (id) => {
    const response = await api.get(`/ebooks/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  deleteEbook: async (id) => {
    const response = await api.delete(`/ebooks/${id}`);
    return response.data;
  },
};
