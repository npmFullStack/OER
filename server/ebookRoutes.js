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

// CORRECTED PATH: Get to /home/opol/uploads
const SERVER_DIR = __dirname; // /home/opol/OER/server/routes
const PROJECT_ROOT = path.join(SERVER_DIR, "..", ".."); // Go up two levels to /home/opol
const UPLOADS_DIR = path.join(PROJECT_ROOT, "uploads"); // /home/opol/uploads
const EBOOKS_DIR = path.join(UPLOADS_DIR, "ebooks");
const COVERS_DIR = path.join(UPLOADS_DIR, "covers");

console.log("📁 File storage locations:");
console.log("  - Server directory:", SERVER_DIR);
console.log("  - Project root:", PROJECT_ROOT);
console.log("  - Uploads directory:", UPLOADS_DIR);
console.log("  - Ebooks directory:", EBOOKS_DIR);
console.log("  - Covers directory:", COVERS_DIR);

// File size limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// =============================================
// DIRECTORY SETUP
// =============================================
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
      console.log(`✅ Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`❌ Failed to create directory ${dirPath}:`, error.message);
      throw error;
    }
  }
};

try {
  [UPLOADS_DIR, EBOOKS_DIR, COVERS_DIR].forEach(createDirectoryIfNotExists);
} catch (error) {
  console.error("❌ Error creating directories:", error);
  // Don't throw - let the server continue running
}

// =============================================
// MULTER CONFIGURATION
// =============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      ebook: EBOOKS_DIR,
      cover: COVERS_DIR,
    };

    const destination = destinations[file.fieldname];
    if (destination) {
      // Check if directory exists before passing to multer
      if (!fs.existsSync(destination)) {
        try {
          fs.mkdirSync(destination, { recursive: true, mode: 0o755 });
        } catch (error) {
          return cb(new Error(`Cannot create directory: ${destination}`), null);
        }
      }
      cb(null, destination);
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filenames = {
      ebook: `${uniqueSuffix}${path.extname(file.originalname)}`,
      cover: `cover-${uniqueSuffix}.jpg`,
    };

    const filename = filenames[file.fieldname];
    if (filename) {
      cb(null, filename);
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    ebook: ["application/pdf"],
    cover: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  };

  const allowedMimeTypes = allowedTypes[file.fieldname];

  if (!allowedMimeTypes) {
    return cb(new Error("Unexpected field"), false);
  }

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const errorMessage =
      file.fieldname === "ebook"
        ? "Only PDF files are allowed"
        : "Only image files are allowed for cover";
    cb(new Error(errorMessage), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// =============================================
// UTILITY FUNCTIONS
// =============================================
const getFilenameFromPath = (filePath) => {
  if (!filePath) return null;
  return filePath.split(/[\/\\]/).pop();
};

const withUrls = (ebook) => ({
  ...ebook,
  file_url: ebook.file_path
    ? `/uploads/ebooks/${getFilenameFromPath(ebook.file_path)}`
    : null,
  cover_url: ebook.cover_image_path
    ? `/uploads/covers/${getFilenameFromPath(ebook.cover_image_path)}`
    : null,
});

const safeDeleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }
};

// =============================================
// DEBUG ENDPOINT
// =============================================
router.get("/debug", (req, res) => {
  const debug = {
    directories: {
      serverDir: SERVER_DIR,
      projectRoot: PROJECT_ROOT,
      uploads: UPLOADS_DIR,
      ebooks: EBOOKS_DIR,
      covers: COVERS_DIR,
    },
    directoryStatus: {
      uploadsExists: fs.existsSync(UPLOADS_DIR),
      ebooksExists: fs.existsSync(EBOOKS_DIR),
      coversExists: fs.existsSync(COVERS_DIR),
    },
    files: {
      ebooks: fs.existsSync(EBOOKS_DIR) ? fs.readdirSync(EBOOKS_DIR) : [],
      covers: fs.existsSync(COVERS_DIR) ? fs.readdirSync(COVERS_DIR) : [],
    },
  };
  res.json(debug);
});

// =============================================
// PUBLIC ROUTES
// =============================================

// Get all ebooks
router.get("/", async (req, res) => {
  try {
    const [ebooks] = await pool.query(`
      SELECT e.*, CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
      FROM ebooks e 
      JOIN users u ON e.uploaded_by = u.id 
      ORDER BY e.created_at DESC
    `);

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

// Get single ebook
router.get("/:id", async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      `
      SELECT e.*, CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
      FROM ebooks e 
      JOIN users u ON e.uploaded_by = u.id 
      WHERE e.id = ?
    `,
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

// Download ebook and increment download count
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

    // Increment download count asynchronously (don't await)
    pool
      .query("UPDATE ebooks SET downloads = downloads + 1 WHERE id = ?", [
        req.params.id,
      ])
      .catch((err) =>
        console.error("Failed to increment download count:", err),
      );

    res.download(ebook.file_path, ebook.file_name);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

// =============================================
// PROTECTED ROUTES
// =============================================

// Upload ebook
router.post(
  "/upload",
  authenticateToken,
  upload.fields([
    { name: "ebook", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("📤 Upload request received");

    try {
      // Validate ebook file
      if (!req.files?.ebook?.[0]) {
        return res
          .status(400)
          .json(createResponse(false, "Please upload a PDF file"));
      }

      const ebookFile = req.files.ebook[0];
      const { title, course, yearLevel } = req.body;

      // Validate required fields
      if (!title?.trim() || !course?.trim() || !yearLevel?.trim()) {
        safeDeleteFile(ebookFile.path);
        return res
          .status(400)
          .json(createResponse(false, "Please fill in all required fields"));
      }

      console.log("✅ PDF saved at:", ebookFile.path);
      console.log("📊 PDF size:", ebookFile.size, "bytes");

      let coverImagePath = null;

      // Handle cover image or extract from PDF
      if (req.files.cover?.[0]) {
        coverImagePath = req.files.cover[0].path;
        console.log("✅ Cover image saved:", coverImagePath);
      } else {
        console.log("🔄 Extracting cover from PDF...");
        try {
          coverImagePath = await extractCoverFromPDF(
            ebookFile.path,
            COVERS_DIR,
          );
          if (coverImagePath) {
            console.log("✅ Cover extracted from PDF:", coverImagePath);
          }
        } catch (coverError) {
          console.error("❌ Cover extraction failed:", coverError);
        }
      }

      // Insert into database
      console.log("💾 Inserting into database...");
      const [result] = await pool.query(
        `INSERT INTO ebooks 
         (title, course, year_level, file_name, file_path, file_size, cover_image_path, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title.trim(),
          course.trim(),
          yearLevel.trim(),
          ebookFile.originalname,
          ebookFile.path,
          ebookFile.size,
          coverImagePath,
          req.user.id,
        ],
      );

      // Fetch the created ebook
      const [ebooks] = await pool.query(
        `
        SELECT e.*, CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
        FROM ebooks e 
        JOIN users u ON e.uploaded_by = u.id 
        WHERE e.id = ?
      `,
        [result.insertId],
      );

      console.log("✅ Upload complete for:", title);

      res.status(201).json(
        createResponse(true, "eBook uploaded successfully", {
          ebook: withUrls(ebooks[0]),
        }),
      );
    } catch (error) {
      console.error("❌ Upload error:", error);

      // Clean up files on error
      if (req.files?.ebook?.[0]) {
        safeDeleteFile(req.files.ebook[0].path);
      }
      if (req.files?.cover?.[0]) {
        safeDeleteFile(req.files.cover[0].path);
      }

      res
        .status(500)
        .json(
          createResponse(false, "Server error during upload: " + error.message),
        );
    }
  },
);

// Get user's own ebooks
router.get("/my-ebooks", authenticateToken, async (req, res) => {
  try {
    const [ebooks] = await pool.query(
      "SELECT * FROM ebooks WHERE uploaded_by = ? ORDER BY created_at DESC",
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

    // Delete physical files
    safeDeleteFile(ebook.file_path);
    safeDeleteFile(ebook.cover_image_path);

    // Delete database record
    await pool.query("DELETE FROM ebooks WHERE id = ?", [req.params.id]);

    res.json(createResponse(true, "eBook deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

export default router;
