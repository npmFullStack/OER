// server/routes/programRoutes.js
import express from "express";
import pool from "./db.js";
import { authenticateToken } from "./authMiddleware.js";
import { createResponse } from "./helper.js";

const router = express.Router();

// =============================================
// PUBLIC ROUTES
// =============================================

// Get all programs (public - for displaying in ebook uploads)
router.get("/", async (req, res) => {
  try {
    const [programs] = await pool.query(`
      SELECT p.*, 
             CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
             (SELECT COUNT(*) FROM ebooks WHERE program_id = p.id) as total_ebooks
      FROM programs p 
      JOIN users u ON p.created_by = u.id 
      ORDER BY p.name ASC
    `);

    res.json(createResponse(true, "Programs retrieved successfully", programs));
  } catch (error) {
    console.error("Get programs error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Get programs with ebook counts (must be before /:id to avoid Express treating "with-ebook-counts" as an id param)
router.get("/with-ebook-counts", async (req, res) => {
  try {
    const [programs] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.acronym,
        p.color,
        COUNT(e.id) as total_ebooks,    
        SUM(e.downloads) as total_downloads
      FROM programs p
      LEFT JOIN ebooks e ON p.id = e.program_id
      GROUP BY p.id
      ORDER BY total_ebooks DESC           
    `);

    res.json(
      createResponse(true, "Program stats retrieved successfully", programs),
    );
  } catch (error) {
    console.error("Get program stats error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Get single program
router.get("/:id", async (req, res) => {
  try {
    const [programs] = await pool.query(
      `SELECT p.*, 
              CONCAT(u.firstname, ' ', u.lastname) as created_by_name,
              (SELECT COUNT(*) FROM ebooks WHERE program_id = p.id) as total_ebooks
       FROM programs p 
       JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [req.params.id],
    );

    if (programs.length === 0) {
      return res.status(404).json(createResponse(false, "Program not found"));
    }

    res.json(
      createResponse(true, "Program retrieved successfully", programs[0]),
    );
  } catch (error) {
    console.error("Get program error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// =============================================
// PROTECTED ROUTES (require authentication)
// =============================================

// Create new program
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, acronym, color } = req.body;

    // Validate required fields
    if (!name?.trim() || !acronym?.trim()) {
      return res
        .status(400)
        .json(createResponse(false, "Program name and acronym are required"));
    }

    // Check if acronym already exists
    const [existing] = await pool.query(
      "SELECT id FROM programs WHERE acronym = ?",
      [acronym.toUpperCase()],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json(createResponse(false, "Program acronym already exists"));
    }

    // Insert program
    const [result] = await pool.query(
      `INSERT INTO programs (name, acronym, color, created_by) 
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        acronym.toUpperCase().trim(),
        color || "#3b82f6",
        req.user.id,
      ],
    );

    // Fetch created program
    const [programs] = await pool.query(
      `SELECT p.*, CONCAT(u.firstname, ' ', u.lastname) as created_by_name 
       FROM programs p 
       JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [result.insertId],
    );

    res
      .status(201)
      .json(createResponse(true, "Program created successfully", programs[0]));
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Update program
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, acronym, color } = req.body;
    const programId = req.params.id;

    // Check if program exists and user owns it
    const [programs] = await pool.query(
      "SELECT * FROM programs WHERE id = ? AND created_by = ?",
      [programId, req.user.id],
    );

    if (programs.length === 0) {
      return res
        .status(404)
        .json(createResponse(false, "Program not found or unauthorized"));
    }

    // If acronym is being changed, check if new acronym already exists
    if (acronym && acronym !== programs[0].acronym) {
      const [existing] = await pool.query(
        "SELECT id FROM programs WHERE acronym = ? AND id != ?",
        [acronym.toUpperCase(), programId],
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json(createResponse(false, "Program acronym already exists"));
      }
    }

    // Update program
    await pool.query(
      `UPDATE programs 
       SET name = ?, acronym = ?, color = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        name?.trim() || programs[0].name,
        acronym?.toUpperCase().trim() || programs[0].acronym,
        color || programs[0].color,
        programId,
      ],
    );

    // Fetch updated program
    const [updatedPrograms] = await pool.query(
      `SELECT p.*, CONCAT(u.firstname, ' ', u.lastname) as created_by_name 
       FROM programs p 
       JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [programId],
    );

    res.json(
      createResponse(true, "Program updated successfully", updatedPrograms[0]),
    );
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Delete program
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const programId = req.params.id;

    // Check if program exists and user owns it
    const [programs] = await pool.query(
      "SELECT * FROM programs WHERE id = ? AND created_by = ?",
      [programId, req.user.id],
    );

    if (programs.length === 0) {
      return res
        .status(404)
        .json(createResponse(false, "Program not found or unauthorized"));
    }

    // Check if program has associated ebooks
    const [ebooks] = await pool.query(
      "SELECT COUNT(*) as count FROM ebooks WHERE program_id = ?",
      [programId],
    );

    if (ebooks[0].count > 0) {
      // Option 1: Prevent deletion if has ebooks
      return res
        .status(400)
        .json(
          createResponse(
            false,
            "Cannot delete program with existing ebooks. Please reassign or delete ebooks first.",
          ),
        );

      // Option 2: Set program_id to NULL for associated ebooks
      // await pool.query("UPDATE ebooks SET program_id = NULL WHERE program_id = ?", [programId]);
    }

    // Delete program
    await pool.query("DELETE FROM programs WHERE id = ?", [programId]);

    res.json(createResponse(true, "Program deleted successfully"));
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

export default router;
