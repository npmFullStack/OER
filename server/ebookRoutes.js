// server/routes/ebookRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "./db.js";
import { authenticateToken } from "./authMiddleware.js";
import { createResponse } from "./helper.js";
import { extractCoverFromPDF } from "./pdfCoverExtractor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
const ebooksDir = path.join(uploadsDir, "ebooks");
const coversDir = path.join(uploadsDir, "covers");

[uploadsDir, ebooksDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ebooksDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper to build URL fields from DB row
const withUrls = (ebook) => ({
  ...ebook,
  file_url: ebook.file_path
    ? `/uploads/ebooks/${path.basename(ebook.file_path)}`
    : null,
  cover_url: ebook.cover_image_path
    ? `/uploads/covers/${path.basename(ebook.cover_image_path)}`
    : null,
});

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

// Get all ebooks (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `SELECT e.*, 
       CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
       FROM ebooks e 
       JOIN users u ON e.uploaded_by = u.id 
       ORDER BY e.created_at DESC`,
    );
    res.json(
      createResponse(
        true,
        "eBooks retrieved successfully",
        ebooks.map(withUrls),
      ),
    );
  } catch (error) {
    console.error("Get ebooks error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// ─────────────────────────────────────────────
// PROTECTED ROUTES  (must come before /:id)
// ─────────────────────────────────────────────

// Upload ebook (PROTECTED)
router.post(
  "/upload",
  authenticateToken,
  upload.single("ebook"),
  async (req, res) => {
    let coverImagePath = null;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json(createResponse(false, "Please upload a PDF file"));
      }

      const { title, course, yearLevel } = req.body;

      if (!title || !course || !yearLevel) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json(createResponse(false, "Please fill in all required fields"));
      }

      // Extract cover image from PDF (non-critical)
      try {
        coverImagePath = await extractCoverFromPDF(req.file.path, coversDir);
        if (coverImagePath)
          console.log("Cover extracted successfully:", coverImagePath);
      } catch (coverError) {
        console.error("Cover extraction failed (non-critical):", coverError);
      }

      const [result] = await pool.query(
        `INSERT INTO ebooks 
         (title, course, year_level, file_name, file_path, file_size, cover_image_path, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          course,
          yearLevel,
          req.file.originalname,
          req.file.path,
          req.file.size,
          coverImagePath,
          req.user.id,
        ],
      );

      const [ebooks] = await pool.query(
        `SELECT e.*, 
         CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
         FROM ebooks e 
         JOIN users u ON e.uploaded_by = u.id 
         WHERE e.id = ?`,
        [result.insertId],
      );

      res.status(201).json(
        createResponse(true, "eBook uploaded successfully", {
          ebook: withUrls(ebooks[0]),
        }),
      );
    } catch (error) {
      console.error("Upload error:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      if (coverImagePath && fs.existsSync(coverImagePath)) {
        try {
          fs.unlinkSync(coverImagePath);
        } catch {}
      }
      res.status(500).json(createResponse(false, "Server error during upload"));
    }
  },
);

// Get user's own ebooks (PROTECTED) — MUST be before /:id
router.get("/my-ebooks", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `SELECT * FROM ebooks WHERE uploaded_by = ? ORDER BY created_at DESC`,
      [req.user.id],
    );
    res.json(
      createResponse(
        true,
        "Your ebooks retrieved successfully",
        ebooks.map(withUrls),
      ),
    );
  } catch (error) {
    console.error("Get my ebooks error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// ─────────────────────────────────────────────
// PARAM ROUTES  (wildcards last)
// ─────────────────────────────────────────────

// Get single ebook (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `SELECT e.*, 
       CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
       FROM ebooks e 
       JOIN users u ON e.uploaded_by = u.id 
       WHERE e.id = ?`,
      [req.params.id],
    );

    if (ebooks.length === 0) {
      return res.status(404).json(createResponse(false, "eBook not found"));
    }

    res.json(
      createResponse(true, "eBook retrieved successfully", withUrls(ebooks[0])),
    );
  } catch (error) {
    console.error("Get ebook error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Download ebook — increment download count (PUBLIC)
router.get("/:id/download", async (req, res) => {
  try {
    const [ebooks] = await pool.query("SELECT * FROM ebooks WHERE id = ?", [
      req.params.id,
    ]);

    if (ebooks.length === 0) {
      return res.status(404).json(createResponse(false, "eBook not found"));
    }

    const ebook = ebooks[0];

    if (!fs.existsSync(ebook.file_path)) {
      return res.status(404).json(createResponse(false, "File not found"));
    }

    await pool.query(
      "UPDATE ebooks SET downloads = downloads + 1 WHERE id = ?",
      [req.params.id],
    );
    res.download(ebook.file_path, ebook.file_name);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Delete ebook (PROTECTED)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      "SELECT * FROM ebooks WHERE id = ? AND uploaded_by = ?",
      [req.params.id, req.user.id],
    );

    if (ebooks.length === 0) {
      return res
        .status(404)
        .json(createResponse(false, "eBook not found or unauthorized"));
    }

    const ebook = ebooks[0];

    if (fs.existsSync(ebook.file_path)) fs.unlinkSync(ebook.file_path);
    if (ebook.cover_image_path && fs.existsSync(ebook.cover_image_path)) {
      fs.unlinkSync(ebook.cover_image_path);
    }

    await pool.query("DELETE FROM ebooks WHERE id = ?", [req.params.id]);
    res.json(createResponse(true, "eBook deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

export default router;
