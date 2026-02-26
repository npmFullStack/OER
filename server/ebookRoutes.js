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

// Upload ebook
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
        // Delete uploaded file if validation fails
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res
          .status(400)
          .json(createResponse(false, "Please fill in all required fields"));
      }

      // Extract cover image from PDF (optional - don't fail if it doesn't work)
      try {
        coverImagePath = await extractCoverFromPDF(req.file.path, coversDir);
        if (coverImagePath) {
          console.log("Cover extracted successfully:", coverImagePath);
        }
      } catch (coverError) {
        console.error("Cover extraction failed (non-critical):", coverError);
        // Continue with upload even if cover extraction fails
      }

      // Insert ebook into database
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

      // Get the inserted ebook
      const [ebooks] = await pool.query(
        `SELECT e.*, 
         CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
         FROM ebooks e 
         JOIN users u ON e.uploaded_by = u.id 
         WHERE e.id = ?`,
        [result.insertId],
      );

      // Convert file path to URL for response
      const ebookData = ebooks[0];
      const responseData = {
        ...ebookData,
        file_url: `/uploads/ebooks/${path.basename(ebookData.file_path)}`,
        cover_url: ebookData.cover_image_path
          ? `/uploads/covers/${path.basename(ebookData.cover_image_path)}`
          : null,
      };

      res.status(201).json(
        createResponse(true, "eBook uploaded successfully", {
          ebook: responseData,
        }),
      );
    } catch (error) {
      console.error("Upload error:", error);

      // Delete uploaded file if database insertion fails
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }

      // Delete cover image if it was created but database insert failed
      if (coverImagePath && fs.existsSync(coverImagePath)) {
        try {
          fs.unlinkSync(coverImagePath);
        } catch (unlinkError) {
          console.error("Error deleting cover:", unlinkError);
        }
      }

      res.status(500).json(createResponse(false, "Server error during upload"));
    }
  },
);

// Get all ebooks
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `SELECT e.*, 
       CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
       FROM ebooks e 
       JOIN users u ON e.uploaded_by = u.id 
       ORDER BY e.created_at DESC`,
    );

    // Add URLs for files and covers
    const ebooksWithUrls = ebooks.map((ebook) => ({
      ...ebook,
      file_url: ebook.file_path
        ? `/uploads/ebooks/${path.basename(ebook.file_path)}`
        : null,
      cover_url: ebook.cover_image_path
        ? `/uploads/covers/${path.basename(ebook.cover_image_path)}`
        : null,
    }));

    res.json(
      createResponse(true, "eBooks retrieved successfully", ebooksWithUrls),
    );
  } catch (error) {
    console.error("Get ebooks error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Get user's ebooks
router.get("/my-ebooks", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `SELECT * FROM ebooks 
       WHERE uploaded_by = ? 
       ORDER BY created_at DESC`,
      [req.user.id],
    );

    // Add URLs for files and covers
    const ebooksWithUrls = ebooks.map((ebook) => ({
      ...ebook,
      file_url: ebook.file_path
        ? `/uploads/ebooks/${path.basename(ebook.file_path)}`
        : null,
      cover_url: ebook.cover_image_path
        ? `/uploads/covers/${path.basename(ebook.cover_image_path)}`
        : null,
    }));

    res.json(
      createResponse(
        true,
        "Your ebooks retrieved successfully",
        ebooksWithUrls,
      ),
    );
  } catch (error) {
    console.error("Get my ebooks error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Get single ebook
router.get("/:id", authenticateToken, async (req, res) => {
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

    const ebook = ebooks[0];
    // Add URLs for files and covers
    const ebookWithUrls = {
      ...ebook,
      file_url: ebook.file_path
        ? `/uploads/ebooks/${path.basename(ebook.file_path)}`
        : null,
      cover_url: ebook.cover_image_path
        ? `/uploads/covers/${path.basename(ebook.cover_image_path)}`
        : null,
    };

    res.json(
      createResponse(true, "eBook retrieved successfully", ebookWithUrls),
    );
  } catch (error) {
    console.error("Get ebook error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Download ebook (increment download count)
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query("SELECT * FROM ebooks WHERE id = ?", [
      req.params.id,
    ]);

    if (ebooks.length === 0) {
      return res.status(404).json(createResponse(false, "eBook not found"));
    }

    const ebook = ebooks[0];

    // Check if file exists
    if (!fs.existsSync(ebook.file_path)) {
      return res.status(404).json(createResponse(false, "File not found"));
    }

    // Increment download count
    await pool.query(
      "UPDATE ebooks SET downloads = downloads + 1 WHERE id = ?",
      [req.params.id],
    );

    // Send file
    res.download(ebook.file_path, ebook.file_name);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Delete ebook
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

    // Delete file from filesystem
    if (fs.existsSync(ebook.file_path)) {
      fs.unlinkSync(ebook.file_path);
    }

    // Delete cover image if exists
    if (ebook.cover_image_path && fs.existsSync(ebook.cover_image_path)) {
      fs.unlinkSync(ebook.cover_image_path);
    }

    // Delete from database
    await pool.query("DELETE FROM ebooks WHERE id = ?", [req.params.id]);

    res.json(createResponse(true, "eBook deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// Alternative cover extraction endpoint (optional)
router.post("/extract-cover/:id", authenticateToken, async (req, res) => {
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

    // Extract cover from existing PDF
    coverImagePath = await extractCoverFromPDF(req.file.path, coversDir, title);

    if (!coverImagePath) {
      return res
        .status(500)
        .json(createResponse(false, "Failed to extract cover"));
    }

    // Update database with cover path
    await pool.query("UPDATE ebooks SET cover_image_path = ? WHERE id = ?", [
      coverImagePath,
      req.params.id,
    ]);

    res.json(
      createResponse(true, "Cover extracted successfully", {
        cover_url: `/uploads/covers/${path.basename(coverImagePath)}`,
      }),
    );
  } catch (error) {
    console.error("Cover extraction error:", error);
    res
      .status(500)
      .json(createResponse(false, "Server error during cover extraction"));
  }
});

export default router;
