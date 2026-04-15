// src/services/program.service.js
import { supabase } from "@/lib/supabase";

class ProgramService {
  // Get all programs
  async getAllPrograms(includeInactive = false) {
    try {
      let query = supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data: programs, error } = await query;

      if (error) {
        console.error("Error fetching programs:", error);
        return { error: "Failed to fetch programs" };
      }

      // Transform to match component format
      const transformedPrograms = programs.map((program) => ({
        id: program.id,
        name: program.name,
        acronym: program.acronym,
        color: program.color,
        total_books: program.total_books || 0,
        total_ebooks: program.total_ebooks || 0,
        is_active: program.is_active,
        created_at: program.created_at.split("T")[0],
        updated_at: program.updated_at,
      }));

      return { programs: transformedPrograms };
    } catch (error) {
      console.error("Get all programs error:", error);
      return { error: "An error occurred while fetching programs" };
    }
  }

  // Get program by ID
  async getProgramById(programId) {
    try {
      const { data: program, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (error) {
        console.error("Error fetching program:", error);
        return { error: "Failed to fetch program" };
      }

      const transformedProgram = {
        id: program.id,
        name: program.name,
        acronym: program.acronym,
        color: program.color,
        total_books: program.total_books || 0,
        total_ebooks: program.total_ebooks || 0,
        is_active: program.is_active,
        created_at: program.created_at.split("T")[0],
        updated_at: program.updated_at,
        created_by: program.created_by,
        updated_by: program.updated_by,
      };

      return { program: transformedProgram };
    } catch (error) {
      console.error("Get program by ID error:", error);
      return { error: "An error occurred while fetching program" };
    }
  }

  // Get program by acronym
  async getProgramByAcronym(acronym) {
    try {
      const { data: program, error } = await supabase
        .from("programs")
        .select("*")
        .eq("acronym", acronym.toUpperCase())
        .single();

      if (error) {
        return { error: "Program not found" };
      }

      return { program };
    } catch (error) {
      console.error("Get program by acronym error:", error);
      return { error: "An error occurred while fetching program" };
    }
  }

  // Create new program
  async createProgram(programData, userId) {
    try {
      const { name, acronym, color } = programData;

      // Check if acronym already exists
      const { data: existingProgram, error: checkError } = await supabase
        .from("programs")
        .select("acronym")
        .eq("acronym", acronym.toUpperCase());

      if (existingProgram && existingProgram.length > 0) {
        return { error: "Program with this acronym already exists" };
      }

      // Insert new program
      const { data: newProgram, error: insertError } = await supabase
        .from("programs")
        .insert([
          {
            name: name.trim(),
            acronym: acronym.toUpperCase(),
            color: color || "#3b82f6",
            total_books: 0,
            total_ebooks: 0,
            is_active: true,
            created_by: userId,
            updated_by: userId,
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return { error: "Failed to create program" };
      }

      // Log activity
      await this.logActivity(userId, "PROGRAM_CREATED", {
        programId: newProgram.id,
        programName: newProgram.name,
        programAcronym: newProgram.acronym,
      });

      return {
        success: true,
        program: {
          id: newProgram.id,
          name: newProgram.name,
          acronym: newProgram.acronym,
          color: newProgram.color,
          total_books: 0,
          total_ebooks: 0,
          is_active: true,
          created_at: newProgram.created_at.split("T")[0],
        },
      };
    } catch (error) {
      console.error("Create program error:", error);
      return {
        error: error.message || "An error occurred while creating program",
      };
    }
  }

  // Update program
  async updateProgram(programId, programData, userId) {
    try {
      const { name, acronym, color, is_active } = programData;

      // Check if acronym already exists for different program
      if (acronym) {
        const { data: existingProgram, error: checkError } = await supabase
          .from("programs")
          .select("id, acronym")
          .eq("acronym", acronym.toUpperCase());

        if (existingProgram && existingProgram.length > 0) {
          const existingId = existingProgram[0].id;
          if (existingId !== programId) {
            return { error: "Program with this acronym already exists" };
          }
        }
      }

      // Build update object
      const updates = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (name !== undefined) updates.name = name.trim();
      if (acronym !== undefined) updates.acronym = acronym.toUpperCase();
      if (color !== undefined) updates.color = color;
      if (is_active !== undefined) updates.is_active = is_active;

      // Update program
      const { data: updatedProgram, error: updateError } = await supabase
        .from("programs")
        .update(updates)
        .eq("id", programId)
        .select("*")
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return { error: "Failed to update program" };
      }

      // Log activity
      await this.logActivity(userId, "PROGRAM_UPDATED", {
        programId: updatedProgram.id,
        programName: updatedProgram.name,
        updates: Object.keys(updates).filter(
          (key) => key !== "updated_by" && key !== "updated_at",
        ),
      });

      return {
        success: true,
        program: {
          id: updatedProgram.id,
          name: updatedProgram.name,
          acronym: updatedProgram.acronym,
          color: updatedProgram.color,
          total_books: updatedProgram.total_books || 0,
          total_ebooks: updatedProgram.total_ebooks || 0,
          is_active: updatedProgram.is_active,
          created_at: updatedProgram.created_at.split("T")[0],
          updated_at: updatedProgram.updated_at,
        },
      };
    } catch (error) {
      console.error("Update program error:", error);
      return {
        error: error.message || "An error occurred while updating program",
      };
    }
  }

  // Delete program (soft delete - set inactive)
  async deleteProgram(programId, userId) {
    try {
      // First check if program has any books or eBooks
      const { data: program, error: fetchError } = await supabase
        .from("programs")
        .select("total_books, total_ebooks, name")
        .eq("id", programId)
        .single();

      if (fetchError) {
        return { error: "Program not found" };
      }

      if (program.total_books > 0 || program.total_ebooks > 0) {
        return {
          error: `Cannot delete "${program.name}" because it has ${program.total_books} books and ${program.total_ebooks} eBooks assigned. Please reassign or remove these resources first.`,
        };
      }

      // Soft delete - set is_active to false
      const { data: deletedProgram, error: deleteError } = await supabase
        .from("programs")
        .update({
          is_active: false,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId)
        .select("*")
        .single();

      if (deleteError) {
        console.error("Delete error:", deleteError);
        return { error: "Failed to delete program" };
      }

      // Log activity
      await this.logActivity(userId, "PROGRAM_DELETED", {
        programId: deletedProgram.id,
        programName: deletedProgram.name,
        programAcronym: deletedProgram.acronym,
      });

      return { success: true };
    } catch (error) {
      console.error("Delete program error:", error);
      return {
        error: error.message || "An error occurred while deleting program",
      };
    }
  }

  // Hard delete program (permanent deletion - use with caution)
  async hardDeleteProgram(programId, userId) {
    try {
      // First check if program has any books or eBooks
      const { data: program, error: fetchError } = await supabase
        .from("programs")
        .select("total_books, total_ebooks, name")
        .eq("id", programId)
        .single();

      if (fetchError) {
        return { error: "Program not found" };
      }

      if (program.total_books > 0 || program.total_ebooks > 0) {
        return {
          error: `Cannot delete "${program.name}" because it has ${program.total_books} books and ${program.total_ebooks} eBooks assigned.`,
        };
      }

      // Hard delete
      const { error: deleteError } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (deleteError) {
        console.error("Hard delete error:", deleteError);
        return { error: "Failed to permanently delete program" };
      }

      // Log activity
      await this.logActivity(userId, "PROGRAM_HARD_DELETED", {
        programId: programId,
        programName: program.name,
      });

      return { success: true };
    } catch (error) {
      console.error("Hard delete program error:", error);
      return {
        error: error.message || "An error occurred while deleting program",
      };
    }
  }

  // Restore program (set active)
  async restoreProgram(programId, userId) {
    try {
      const { data: restoredProgram, error: restoreError } = await supabase
        .from("programs")
        .update({
          is_active: true,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId)
        .select("*")
        .single();

      if (restoreError) {
        console.error("Restore error:", restoreError);
        return { error: "Failed to restore program" };
      }

      // Log activity
      await this.logActivity(userId, "PROGRAM_RESTORED", {
        programId: restoredProgram.id,
        programName: restoredProgram.name,
      });

      return { success: true };
    } catch (error) {
      console.error("Restore program error:", error);
      return {
        error: error.message || "An error occurred while restoring program",
      };
    }
  }

  // Update book counts for a program
  async updateProgramCounts(programId) {
    try {
      // This function would be called when books/eBooks are added/removed
      // You'll need to implement actual counts based on your books table

      // For now, this is a placeholder. When you have a books table, you would:
      // 1. Count books associated with this program
      // 2. Count eBooks associated with this program
      // 3. Update the program record

      // Example (when books table exists):
      // const { count: bookCount } = await supabase
      //   .from("books")
      //   .select("*", { count: "exact", head: true })
      //   .eq("program_id", programId)
      //   .eq("type", "physical");
      //
      // const { count: ebookCount } = await supabase
      //   .from("books")
      //   .select("*", { count: "exact", head: true })
      //   .eq("program_id", programId)
      //   .eq("type", "digital");
      //
      // const { error } = await supabase
      //   .from("programs")
      //   .update({
      //     total_books: bookCount,
      //     total_ebooks: ebookCount
      //   })
      //   .eq("id", programId);

      return { success: true };
    } catch (error) {
      console.error("Update program counts error:", error);
      return { error: "Failed to update program counts" };
    }
  }

  // Get program statistics
  async getProgramStatistics() {
    try {
      const { data: programs, error } = await supabase
        .from("programs")
        .select("name, acronym, color, total_books, total_ebooks, is_active")
        .eq("is_active", true);

      if (error) {
        return { error: "Failed to fetch program statistics" };
      }

      const stats = {
        totalPrograms: programs.length,
        totalBooks: programs.reduce((sum, p) => sum + (p.total_books || 0), 0),
        totalEBooks: programs.reduce(
          (sum, p) => sum + (p.total_ebooks || 0),
          0,
        ),
        activePrograms: programs.filter((p) => p.is_active).length,
        programsWithBooks: programs.filter((p) => (p.total_books || 0) > 0)
          .length,
        topPrograms: [...programs]
          .sort(
            (a, b) =>
              b.total_books + b.total_ebooks - (a.total_books + a.total_ebooks),
          )
          .slice(0, 5),
      };

      return { statistics: stats, programs };
    } catch (error) {
      console.error("Get program statistics error:", error);
      return { error: "An error occurred while fetching statistics" };
    }
  }

  // Bulk create programs
  async bulkCreatePrograms(programsData, userId) {
    try {
      const results = [];
      const errors = [];

      for (const programData of programsData) {
        const result = await this.createProgram(programData, userId);
        if (result.success) {
          results.push(result.program);
        } else {
          errors.push({ data: programData, error: result.error });
        }
      }

      return {
        success: errors.length === 0,
        created: results,
        errors: errors,
        totalCreated: results.length,
        totalErrors: errors.length,
      };
    } catch (error) {
      console.error("Bulk create programs error:", error);
      return { error: "An error occurred during bulk creation" };
    }
  }

  // Validate program data
  validateProgramData(programData) {
    const errors = [];

    if (!programData.name || programData.name.trim().length < 3) {
      errors.push("Program name must be at least 3 characters long");
    }

    if (!programData.acronym || programData.acronym.trim().length < 2) {
      errors.push("Program acronym must be at least 2 characters long");
    }

    if (programData.acronym && programData.acronym.length > 10) {
      errors.push("Program acronym cannot exceed 10 characters");
    }

    if (programData.color && !/^#[0-9A-Fa-f]{6}$/.test(programData.color)) {
      errors.push("Invalid color format. Use hex color code (e.g., #3b82f6)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Log activity
  async logActivity(userId, action, details = {}) {
    try {
      await supabase.from("activity_logs").insert([
        {
          user_id: userId,
          action,
          details,
          user_agent: navigator.userAgent,
        },
      ]);
    } catch (error) {
      console.error("Log activity error:", error);
    }
  }
}

export default new ProgramService();
