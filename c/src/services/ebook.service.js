// src/services/ebook.service.js
import { supabase } from "@/lib/supabase";
import authService from "./auth.service";

// Lazy-load pdfjs with local worker via Vite's ?url import — no CDN, no 404s
async function getPdfjsLib() {
  const [pdfjsLib, workerUrl] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
  return pdfjsLib;
}

class EbookService {
  // ============================================
  // EBOOK MANAGEMENT
  // ============================================

  async getEbooks(filters = {}) {
    try {
      let query = supabase.from("ebooks").select(`
          *,
          program:program_id (
            id,
            name,
            acronym,
            color
          ),
          uploader:uploaded_by (
            id,
            firstname,
            lastname,
            email
          )
        `);

      if (filters.programId) query = query.eq("program_id", filters.programId);
      if (filters.yearLevel) query = query.eq("year_level", filters.yearLevel);
      if (filters.status) {
        query = query.eq("status", filters.status);
      } else {
        query = query.eq("status", "published");
      }
      if (filters.isFeatured) query = query.eq("is_featured", true);
      if (filters.searchTerm)
        query = query.ilike("title", `%${filters.searchTerm}%`);

      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder === "asc" ? true : false;
      query = query.order(sortBy, { ascending: sortOrder });

      if (filters.limit) query = query.limit(filters.limit);
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1,
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return { ebooks: data || [], error: null };
    } catch (error) {
      console.error("Get ebooks error:", error);
      return { ebooks: [], error: error.message };
    }
  }

  async getEbookById(id) {
    try {
      const { data, error } = await supabase
        .from("ebooks")
        .select(
          `
          *,
          program:program_id (
            id,
            name,
            acronym,
            color
          ),
          uploader:uploaded_by (
            id,
            firstname,
            lastname,
            email
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return { ebook: data, error: null };
    } catch (error) {
      console.error("Get ebook by ID error:", error);
      return { ebook: null, error: error.message };
    }
  }

  async getEbooksByProgram(programId, filters = {}) {
    return this.getEbooks({ ...filters, programId });
  }

  async getEbooksByUploader(uploaderId, filters = {}) {
    try {
      let query = supabase
        .from("ebooks")
        .select(
          `
          *,
          program:program_id (
            id,
            name,
            acronym,
            color
          ),
          uploader:uploaded_by (
            id,
            firstname,
            lastname,
            email
          )
        `,
        )
        .eq("uploaded_by", uploaderId);

      if (filters.status) query = query.eq("status", filters.status);
      if (filters.searchTerm)
        query = query.ilike("title", `%${filters.searchTerm}%`);

      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder === "desc" ? true : false;
      query = query.order(sortBy, { ascending: sortOrder });

      const { data, error } = await query;
      if (error) throw error;

      return { ebooks: data || [], error: null };
    } catch (error) {
      console.error("Get ebooks by uploader error:", error);
      return { ebooks: [], error: error.message };
    }
  }

  async createEbook(ebookData, pdfFile) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return { error: "Authentication required" };
      if (!pdfFile) return { error: "PDF file is required" };

      const fileUpload = await this.uploadEbookFile(pdfFile, currentUser.id);
      if (fileUpload.error) return { error: fileUpload.error };

      let coverInfo = { cover_url: null, cover_storage_path: null };
      if (fileUpload.extractedCover) {
        coverInfo = await this.uploadEbookCover(
          fileUpload.extractedCover,
          currentUser.id,
          fileUpload.file_name_without_ext,
        );
      }

      const { data, error } = await supabase
        .from("ebooks")
        .insert([
          {
            title: ebookData.title,
            program_id: ebookData.programId,
            year_level: ebookData.yearLevel,
            file_name: pdfFile.name,
            file_size: `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB`,
            file_url: fileUpload.file_url,
            file_storage_path: fileUpload.file_storage_path,
            cover_url: coverInfo.cover_url,
            cover_storage_path: coverInfo.cover_storage_path,
            status: ebookData.status || "published",
            is_featured: ebookData.is_featured || false,
            uploaded_by: currentUser.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await authService.logActivity(currentUser.id, "EBOOK_CREATED", {
        ebookId: data.id,
        title: data.title,
      });

      return { ebook: data, error: null };
    } catch (error) {
      console.error("Create ebook error:", error);
      return { ebook: null, error: error.message };
    }
  }

  async updateEbook(id, updates, newPdfFile = null) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return { error: "Authentication required" };

      const { ebook: existing, error: getError } = await this.getEbookById(id);
      if (getError || !existing) return { error: "Ebook not found" };

      let fileInfo = {};
      let coverInfo = {};

      if (newPdfFile) {
        if (existing.file_storage_path)
          await this.deleteEbookFile(existing.file_storage_path);
        if (existing.cover_storage_path)
          await this.deleteEbookCover(existing.cover_storage_path);

        const fileUpload = await this.uploadEbookFile(
          newPdfFile,
          currentUser.id,
        );
        if (fileUpload.error) return { error: fileUpload.error };

        fileInfo = {
          file_name: newPdfFile.name,
          file_size: `${(newPdfFile.size / (1024 * 1024)).toFixed(2)} MB`,
          file_url: fileUpload.file_url,
          file_storage_path: fileUpload.file_storage_path,
        };

        if (fileUpload.extractedCover) {
          const coverUpload = await this.uploadEbookCover(
            fileUpload.extractedCover,
            currentUser.id,
            fileUpload.file_name_without_ext,
          );
          coverInfo = {
            cover_url: coverUpload.cover_url,
            cover_storage_path: coverUpload.cover_storage_path,
          };
        }
      }

      const updateData = {
        updated_at: new Date().toISOString(),
        ...updates,
        ...fileInfo,
        ...coverInfo,
      };

      const { data, error } = await supabase
        .from("ebooks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await authService.logActivity(currentUser.id, "EBOOK_UPDATED", {
        ebookId: id,
        updates: Object.keys(updates),
        fileReplaced: !!newPdfFile,
      });

      return { ebook: data, error: null };
    } catch (error) {
      console.error("Update ebook error:", error);
      return { ebook: null, error: error.message };
    }
  }

  async deleteEbook(id) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return { error: "Authentication required" };

      const { ebook, error: getError } = await this.getEbookById(id);
      if (getError || !ebook) return { error: "Ebook not found" };

      if (ebook.file_storage_path)
        await this.deleteEbookFile(ebook.file_storage_path);
      if (ebook.cover_storage_path)
        await this.deleteEbookCover(ebook.cover_storage_path);

      const { error } = await supabase.from("ebooks").delete().eq("id", id);
      if (error) throw error;

      await authService.logActivity(currentUser.id, "EBOOK_DELETED", {
        ebookId: id,
        title: ebook.title,
      });

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete ebook error:", error);
      return { success: false, error: error.message };
    }
  }

  async incrementViews(id) {
    try {
      const { error } = await supabase.rpc("increment_ebook_views", {
        ebook_id: id,
      });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Increment views error:", error);
      return { success: false, error: error.message };
    }
  }

  async incrementDownloads(id) {
    try {
      const { error } = await supabase.rpc("increment_ebook_downloads", {
        ebook_id: id,
      });
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Increment downloads error:", error);
      return { success: false, error: error.message };
    }
  }

  async downloadEbook(ebookId) {
    try {
      const { ebook, error: getError } = await this.getEbookById(ebookId);
      if (getError || !ebook) return { error: "Ebook not found" };
      if (!ebook.file_url) return { error: "No file attached to this ebook" };

      await this.incrementDownloads(ebookId);
      return { url: ebook.file_url, error: null };
    } catch (error) {
      console.error("Download ebook error:", error);
      return { error: error.message };
    }
  }

  async getFeaturedEbooks(limit = 6) {
    return this.getEbooks({ isFeatured: true, limit });
  }

  async getStatistics() {
    try {
      const { count: total, error: totalError } = await supabase
        .from("ebooks")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      if (totalError) throw totalError;

      const { data: viewsData, error: viewsError } = await supabase
        .from("ebooks")
        .select("views")
        .eq("status", "published");
      if (viewsError) throw viewsError;
      const totalViews = viewsData.reduce(
        (sum, item) => sum + (item.views || 0),
        0,
      );

      const { data: downloadsData, error: downloadsError } = await supabase
        .from("ebooks")
        .select("downloads")
        .eq("status", "published");
      if (downloadsError) throw downloadsError;
      const totalDownloads = downloadsData.reduce(
        (sum, item) => sum + (item.downloads || 0),
        0,
      );

      const { data: programData, error: programError } = await supabase
        .from("ebooks")
        .select("program:program_id (name, acronym)")
        .eq("status", "published");
      if (programError) throw programError;

      const byProgram = {};
      programData.forEach((item) => {
        const programName = item.program?.acronym || "Unknown";
        byProgram[programName] = (byProgram[programName] || 0) + 1;
      });

      const { data: yearData, error: yearError } = await supabase
        .from("ebooks")
        .select("year_level")
        .eq("status", "published");
      if (yearError) throw yearError;

      const byYearLevel = {
        "1st Year": 0,
        "2nd Year": 0,
        "3rd Year": 0,
        "4th Year": 0,
      };
      yearData.forEach((item) => {
        const level =
          item.year_level === "1"
            ? "1st Year"
            : item.year_level === "2"
              ? "2nd Year"
              : item.year_level === "3"
                ? "3rd Year"
                : "4th Year";
        byYearLevel[level]++;
      });

      return {
        stats: { total, totalViews, totalDownloads, byProgram, byYearLevel },
        error: null,
      };
    } catch (error) {
      console.error("Get statistics error:", error);
      return { stats: null, error: error.message };
    }
  }

  // ============================================
  // FILE MANAGEMENT
  // ============================================

  async uploadEbookFile(file, userId) {
    try {
      if (!file) return { error: "No file provided" };

      const fileExt = file.name.split(".").pop();
      const fileNameWithoutExt = file.name.replace(`.${fileExt}`, "");
      const fileName = `${Date.now()}_${userId}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `ebooks/${fileName}`;

      // Extract cover before uploading
      let extractedCover = null;
      try {
        extractedCover = await this.extractPdfCover(file);
      } catch (err) {
        console.warn("Cover extraction failed:", err);
      }

      const { error: uploadError } = await supabase.storage
        .from("ebook-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("ebook-files").getPublicUrl(filePath);

      return {
        file_url: publicUrl,
        file_name: file.name,
        file_name_without_ext: fileNameWithoutExt,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        file_storage_path: filePath,
        extractedCover,
        error: null,
      };
    } catch (error) {
      console.error("Upload file error:", error);
      return { error: error.message };
    }
  }

  async uploadEbookCover(coverDataUrl, userId, fileNameWithoutExt) {
    try {
      if (!coverDataUrl) return { cover_url: null, cover_storage_path: null };

      const response = await fetch(coverDataUrl);
      const blob = await response.blob();

      const fileName = `${Date.now()}_${userId}_${fileNameWithoutExt
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 50)}.jpg`;
      const coverPath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ebook-covers")
        .upload(coverPath, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("ebook-covers").getPublicUrl(coverPath);

      return {
        cover_url: publicUrl,
        cover_storage_path: coverPath,
        error: null,
      };
    } catch (error) {
      console.error("Upload cover error:", error);
      return {
        cover_url: null,
        cover_storage_path: null,
        error: error.message,
      };
    }
  }

  // Extract cover using local pdfjs worker — no CDN
  async extractPdfCover(file) {
    let canvas = null;
    try {
      const pdfjsLib = await getPdfjsLib();
      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
      });

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const scale = 1.2;
      const viewport = page.getViewport({ scale });

      canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport,
        background: "white",
      }).promise;

      const coverDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      return coverDataUrl;
    } catch (error) {
      console.error("Extract PDF cover error:", error);
      return null;
    } finally {
      if (canvas) canvas.remove();
    }
  }

  async deleteEbookFile(filePath) {
    try {
      if (!filePath) return { success: true };
      const { error } = await supabase.storage
        .from("ebook-files")
        .remove([filePath]);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Delete file error:", error);
      return { success: false, error: error.message };
    }
  }

  async deleteEbookCover(coverPath) {
    try {
      if (!coverPath) return { success: true };
      const { error } = await supabase.storage
        .from("ebook-covers")
        .remove([coverPath]);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Delete cover error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EbookService();
