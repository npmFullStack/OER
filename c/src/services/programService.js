// src/services/programService.js
import api from "./api";

const programService = {
  // Get all programs
  getAll: async () => {
    const response = await api.get("/programs");
    return response.data;
  },

  // Get single program by ID
  getById: async (id) => {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  },

  // Create new program
  create: async (programData) => {
    const response = await api.post("/programs", programData);
    return response.data;
  },

  // Update program
  update: async (id, programData) => {
    const response = await api.put(`/programs/${id}`, programData);
    return response.data;
  },

  // Delete program
  delete: async (id) => {
    const response = await api.delete(`/programs/${id}`);
    return response.data;
  },

  // Get programs with ebook counts
  getWithEbookCounts: async () => {
    const response = await api.get("/programs/with-ebook-counts");
    return response.data;
  },
};

export default programService;
