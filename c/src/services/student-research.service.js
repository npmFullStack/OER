// src/services/student-research.service.js
import { supabase } from "@/lib/supabase";
import authService from "./auth.service";

class StudentResearchService {
  // ============================================
  // CATEGORY MANAGEMENT
  // ============================================

  // Get all categories
  async getCategories(includeInactive = false) {
    try {
      let query = supabase
        .from("student_research_category")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { categories: data, error: null };
    } catch (error) {
      console.error("Get categories error:", error);
      return { categories: [], error: error.message };
    }
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    try {
      const { data, error } = await supabase
        .from("student_research_category")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (error) throw error;
      return { category: data, error: null };
    } catch (error) {
      console.error("Get category by ID error:", error);
      return { category: null, error: error.message };
    }
  }

  // Get category by name
  async getCategoryByName(name) {
    try {
      const { data, error } = await supabase
        .from("student_research_category")
        .select("*")
        .eq("name", name)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return { category: data || null, error: null };
    } catch (error) {
      console.error("Get category by name error:", error);
      return { category: null, error: error.message };
    }
  }

  // Create new category (superadmin only)
  async createCategory(categoryData) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "superadmin") {
        return { error: "Only superadmin can create categories" };
      }

      // Check if category already exists
      const { category: existing } = await this.getCategoryByName(
        categoryData.name.toUpperCase(),
      );
      if (existing) {
        return { error: "Category with this name already exists" };
      }

      const { data, error } = await supabase
        .from("student_research_category")
        .insert([
          {
            name: categoryData.name.toUpperCase(),
            description: categoryData.description || null,
            color: categoryData.color || "#3b82f6",
            display_order: categoryData.display_order || 0,
            is_active: categoryData.is_active !== false,
            created_by: currentUser.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "CATEGORY_CREATED", {
        categoryId: data.id,
        name: data.name,
      });

      return { category: data, error: null };
    } catch (error) {
      console.error("Create category error:", error);
      return { category: null, error: error.message };
    }
  }

  // Update category (superadmin only)
  async updateCategory(categoryId, updates) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "superadmin") {
        return { error: "Only superadmin can update categories" };
      }

      const { data, error } = await supabase
        .from("student_research_category")
        .update({
          ...updates,
          updated_by: currentUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "CATEGORY_UPDATED", {
        categoryId: data.id,
        updates: Object.keys(updates),
      });

      return { category: data, error: null };
    } catch (error) {
      console.error("Update category error:", error);
      return { category: null, error: error.message };
    }
  }

  // Delete category (superadmin only)
  async deleteCategory(categoryId) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "superadmin") {
        return { error: "Only superadmin can delete categories" };
      }

      // Check if category has research papers
      const { count, error: countError } = await supabase
        .from("student_research")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryId);

      if (countError) throw countError;

      if (count > 0) {
        return {
          error: `Cannot delete category with ${count} research paper(s). Move or delete them first.`,
        };
      }

      const { error } = await supabase
        .from("student_research_category")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "CATEGORY_DELETED", {
        categoryId,
      });

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete category error:", error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // STUDENT RESEARCH MANAGEMENT
  // ============================================

  // Get all research papers with filters
  async getResearchPapers(filters = {}) {
    try {
      let query = supabase.from("student_research").select(`
          *,
          category:category_id (
            id,
            name,
            color,
            description
          ),
          uploader:uploaded_by (
            id,
            firstname,
            lastname,
            email
          )
        `);

      // Apply filters
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.year) {
        query = query.eq("year", filters.year);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      } else {
        query = query.eq("status", "published");
      }

      if (filters.isFeatured) {
        query = query.eq("is_featured", true);
      }

      if (filters.searchTerm) {
        query = query.or(
          `title.ilike.%${filters.searchTerm}%,authors.cs.{${filters.searchTerm}}`,
        );
      }

      // Sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder === "asc" ? true : false;
      query = query.order(sortBy, { ascending: sortOrder });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { research: data || [], error: null };
    } catch (error) {
      console.error("Get research papers error:", error);
      return { research: [], error: error.message };
    }
  }

  // Get research paper by ID
  async getResearchById(id) {
    try {
      const { data, error } = await supabase
        .from("student_research")
        .select(
          `
          *,
          category:category_id (
            id,
            name,
            color,
            description
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

      return { research: data, error: null };
    } catch (error) {
      console.error("Get research by ID error:", error);
      return { research: null, error: error.message };
    }
  }

  // Create new research paper
  async createResearch(researchData, file = null) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { error: "Authentication required" };
      }

      let fileInfo = {
        file_url: null,
        file_name: null,
        file_size: null,
        file_storage_path: null,
      };

      // Upload file if provided
      if (file) {
        const fileUpload = await this.uploadResearchFile(file, currentUser.id);
        if (fileUpload.error) {
          return { error: fileUpload.error };
        }
        fileInfo = fileUpload;
      }

      // Get category ID from name or ID
      let categoryId = researchData.categoryId;
      if (researchData.categoryName && !categoryId) {
        const { category, error: catError } = await this.getCategoryByName(
          researchData.categoryName,
        );
        if (catError || !category) {
          return { error: "Invalid category" };
        }
        categoryId = category.id;
      }

      const { data, error } = await supabase
        .from("student_research")
        .insert([
          {
            title: researchData.title,
            authors: researchData.authors || [],
            category_id: categoryId,
            year: researchData.year || new Date().getFullYear(),
            file_url: fileInfo.file_url,
            file_name: fileInfo.file_name,
            file_size: fileInfo.file_size,
            file_storage_path: fileInfo.file_storage_path,
            cover_url: researchData.cover_url || null,
            abstract: researchData.abstract || null,
            keywords: researchData.keywords || [],
            status: researchData.status || "published",
            is_featured: researchData.is_featured || false,
            uploaded_by: currentUser.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "RESEARCH_CREATED", {
        researchId: data.id,
        title: data.title,
      });

      return { research: data, error: null };
    } catch (error) {
      console.error("Create research error:", error);
      return { research: null, error: error.message };
    }
  }

  // Update research paper
  async updateResearch(id, updates, newFile = null) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { error: "Authentication required" };
      }

      // Get existing research to handle file replacement
      const { research: existing, error: getError } =
        await this.getResearchById(id);
      if (getError || !existing) {
        return { error: "Research paper not found" };
      }

      let fileInfo = {};

      // Upload new file if provided
      if (newFile) {
        // Delete old file if exists
        if (existing.file_storage_path) {
          await this.deleteResearchFile(existing.file_storage_path);
        }

        const fileUpload = await this.uploadResearchFile(
          newFile,
          currentUser.id,
        );
        if (fileUpload.error) {
          return { error: fileUpload.error };
        }
        fileInfo = {
          file_url: fileUpload.file_url,
          file_name: fileUpload.file_name,
          file_size: fileUpload.file_size,
          file_storage_path: fileUpload.file_storage_path,
        };
      }

      // Prepare update data
      const updateData = {
        updated_at: new Date().toISOString(),
        ...updates,
        ...fileInfo,
      };

      // Handle category update via name or ID
      if (updates.categoryName && !updates.categoryId) {
        const { category, error: catError } = await this.getCategoryByName(
          updates.categoryName,
        );
        if (catError || !category) {
          return { error: "Invalid category" };
        }
        updateData.category_id = category.id;
        delete updateData.categoryName;
      }

      const { data, error } = await supabase
        .from("student_research")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "RESEARCH_UPDATED", {
        researchId: id,
        updates: Object.keys(updates),
        fileReplaced: !!newFile,
      });

      return { research: data, error: null };
    } catch (error) {
      console.error("Update research error:", error);
      return { research: null, error: error.message };
    }
  }

  // Delete research paper
  async deleteResearch(id) {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        return { error: "Authentication required" };
      }

      // Get research to delete its file
      const { research, error: getError } = await this.getResearchById(id);
      if (getError || !research) {
        return { error: "Research paper not found" };
      }

      // Delete file from storage if exists
      if (research.file_storage_path) {
        await this.deleteResearchFile(research.file_storage_path);
      }

      const { error } = await supabase
        .from("student_research")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await authService.logActivity(currentUser.id, "RESEARCH_DELETED", {
        researchId: id,
        title: research.title,
      });

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete research error:", error);
      return { success: false, error: error.message };
    }
  }

  // Increment view count
  async incrementViews(id) {
    try {
      const { data, error } = await supabase.rpc("increment_research_views", {
        research_id: id,
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Increment views error:", error);
      return { success: false, error: error.message };
    }
  }

  // Increment download count
  async incrementDownloads(id) {
    try {
      const { data, error } = await supabase.rpc(
        "increment_research_downloads",
        {
          research_id: id,
        },
      );

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Increment downloads error:", error);
      return { success: false, error: error.message };
    }
  }

  // Get research by year
  async getResearchByYear(year) {
    return this.getResearchPapers({ year });
  }

  // Get research by category
  async getResearchByCategory(categoryId) {
    return this.getResearchPapers({ categoryId });
  }

  // Get featured research
  async getFeaturedResearch(limit = 5) {
    return this.getResearchPapers({ isFeatured: true, limit });
  }

  // Get research statistics
  async getStatistics() {
    try {
      // Total research count
      const { count: total, error: totalError } = await supabase
        .from("student_research")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      if (totalError) throw totalError;

      // Total views
      const { data: viewsData, error: viewsError } = await supabase
        .from("student_research")
        .select("views")
        .eq("status", "published");

      if (viewsError) throw viewsError;

      const totalViews = viewsData.reduce(
        (sum, item) => sum + (item.views || 0),
        0,
      );

      // Total downloads
      const { data: downloadsData, error: downloadsError } = await supabase
        .from("student_research")
        .select("downloads")
        .eq("status", "published");

      if (downloadsError) throw downloadsError;

      const totalDownloads = downloadsData.reduce(
        (sum, item) => sum + (item.downloads || 0),
        0,
      );

      // Research by year
      const { data: yearData, error: yearError } = await supabase
        .from("student_research")
        .select("year")
        .eq("status", "published");

      if (yearError) throw yearError;

      const byYear = {};
      yearData.forEach((item) => {
        byYear[item.year] = (byYear[item.year] || 0) + 1;
      });

      // Research by category
      const { data: categoryData, error: categoryError } = await supabase
        .from("student_research")
        .select(
          `
          category:category_id (
            name
          )
        `,
        )
        .eq("status", "published");

      if (categoryError) throw categoryError;

      const byCategory = {};
      categoryData.forEach((item) => {
        const categoryName = item.category?.name || "Unknown";
        byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
      });

      return {
        stats: {
          total,
          totalViews,
          totalDownloads,
          byYear,
          byCategory,
        },
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

  // Upload research file to Supabase Storage
  async uploadResearchFile(file, userId) {
    try {
      if (!file) return { error: "No file provided" };

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${userId}_${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;
      const filePath = `student-research/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("research-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("research-files").getPublicUrl(filePath);

      return {
        file_url: publicUrl,
        file_name: file.name,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        file_storage_path: filePath,
        error: null,
      };
    } catch (error) {
      console.error("Upload file error:", error);
      return { error: error.message };
    }
  }

  // Delete research file from storage
  async deleteResearchFile(filePath) {
    try {
      if (!filePath) return { success: true };

      const { error } = await supabase.storage
        .from("research-files")
        .remove([filePath]);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error("Delete file error:", error);
      return { success: false, error: error.message };
    }
  }

  // Download research file
  async downloadResearchFile(researchId) {
    try {
      const { research, error: getError } =
        await this.getResearchById(researchId);
      if (getError || !research) {
        return { error: "Research paper not found" };
      }

      if (!research.file_url) {
        return { error: "No file attached to this research" };
      }

      // Increment download count
      await this.incrementDownloads(researchId);

      return { url: research.file_url, error: null };
    } catch (error) {
      console.error("Download file error:", error);
      return { error: error.message };
    }
  }
}

export default new StudentResearchService();
