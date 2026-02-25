// server/routes/ebookRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "./db.js";
import { authenticateToken } from "./authMiddleware.js";
import { createResponse } from "./helper.js";

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
    try {
      if (!req.file) {
        return res
          .status(400)
          .json(createResponse(false, "Please upload a PDF file"));
      }

      const { title, course, yearLevel } = req.body;

      if (!title || !course || !yearLevel) {
        // Delete uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json(createResponse(false, "Please fill in all required fields"));
      }

      // Insert ebook into database
      const [result] = await pool.query(
        `INSERT INTO ebooks 
         (title, course, year_level, file_name, file_path, file_size, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          course,
          yearLevel,
          req.file.originalname,
          req.file.path,
          req.file.size,
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

      res.status(201).json(
        createResponse(true, "eBook uploaded successfully", {
          ebook: ebooks[0],
        }),
      );
    } catch (error) {
      console.error("Upload error:", error);
      // Delete uploaded file if database insertion fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
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
    res.json(createResponse(true, "eBooks retrieved successfully", ebooks));
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
    res.json(
      createResponse(true, "Your ebooks retrieved successfully", ebooks),
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

    res.json(createResponse(true, "eBook retrieved successfully", ebooks[0]));
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

export default router;
