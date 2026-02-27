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

// IMPORTANT: Define uploads directory relative to server.js location
// Since this file is in server/routes/, we need to go up one level to server/
const serverDir = path.join(__dirname, "..");
const uploadsDir = path.join(serverDir, "uploads");
const ebooksDir = path.join(uploadsDir, "ebooks");
const coversDir = path.join(uploadsDir, "covers");

console.log("🔧 Server directory:", serverDir);
console.log("📁 Uploads directory should be:", uploadsDir);

// Create directories if they don't exist
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Created uploads directory:", uploadsDir);
  }

  if (!fs.existsSync(ebooksDir)) {
    fs.mkdirSync(ebooksDir, { recursive: true });
    console.log("✅ Created ebooks directory:", ebooksDir);
  }

  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
    console.log("✅ Created covers directory:", coversDir);
  }
} catch (error) {
  console.error("❌ Error creating directories:", error);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "ebook") {
      cb(null, ebooksDir);
    } else if (file.fieldname === "cover") {
      // For cover, save directly to covers directory
      cb(null, coversDir);
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    if (file.fieldname === "ebook") {
      cb(null, uniqueSuffix + path.extname(file.originalname));
    } else if (file.fieldname === "cover") {
      cb(null, "cover-" + uniqueSuffix + ".jpg");
    } else {
      cb(new Error("Invalid field name"), null);
    }
  },
});

const fileFilter = (req, file, cb) => {
  console.log("📄 Processing file:", file.fieldname, file.mimetype);

  if (file.fieldname === "ebook") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  } else if (file.fieldname === "cover") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for cover"), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
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
const withUrls = (ebook) => {
  const getFilename = (fullPath) => {
    if (!fullPath) return null;
    return fullPath.split("/").pop() || fullPath.split("\\").pop();
  };

  return {
    ...ebook,
    file_url: ebook.file_path
      ? `/uploads/ebooks/${getFilename(ebook.file_path)}`
      : null,
    cover_url: ebook.cover_image_path
      ? `/uploads/covers/${getFilename(ebook.cover_image_path)}`
      : null,
  };
};

// Debug endpoint to check directories
router.get("/debug", (req, res) => {
  const debug = {
    serverDir,
    uploadsDir,
    ebooksDir,
    coversDir,
    directories: {
      uploadsExists: fs.existsSync(uploadsDir),
      ebooksExists: fs.existsSync(ebooksDir),
      coversExists: fs.existsSync(coversDir),
    },
    files: {
      ebooks: fs.existsSync(ebooksDir) ? fs.readdirSync(ebooksDir) : [],
      covers: fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [],
    },
  };
  res.json(debug);
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
// PROTECTED ROUTES
// ─────────────────────────────────────────────

// Upload ebook (PROTECTED)
router.post(
  "/upload",
  authenticateToken,
  upload.fields([
    { name: "ebook", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("📤 Upload request received");
    console.log("📝 Body:", req.body);
    console.log("📁 Files:", req.files ? Object.keys(req.files) : "No files");

    try {
      // Check if ebook file exists
      if (
        !req.files ||
        !req.files["ebook"] ||
        req.files["ebook"].length === 0
      ) {
        return res
          .status(400)
          .json(createResponse(false, "Please upload a PDF file"));
      }

      const ebookFile = req.files["ebook"][0];
      const { title, course, yearLevel } = req.body;

      if (!title || !course || !yearLevel) {
        // Clean up uploaded PDF
        if (fs.existsSync(ebookFile.path)) {
          fs.unlinkSync(ebookFile.path);
          console.log("🗑️ Deleted PDF due to validation failure");
        }
        return res
          .status(400)
          .json(createResponse(false, "Please fill in all required fields"));
      }

      console.log("✅ PDF saved at:", ebookFile.path);
      console.log("📊 PDF size:", ebookFile.size, "bytes");

      let coverImagePath = null;

      // Handle cover image if provided
      if (req.files["cover"] && req.files["cover"].length > 0) {
        const coverFile = req.files["cover"][0];
        coverImagePath = coverFile.path;
        console.log("✅ Cover image saved:", coverImagePath);
      } else {
        // Extract cover from PDF
        console.log("🔄 Extracting cover from PDF...");
        try {
          coverImagePath = await extractCoverFromPDF(ebookFile.path, coversDir);
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
          title,
          course,
          yearLevel,
          ebookFile.originalname,
          ebookFile.path,
          ebookFile.size,
          coverImagePath,
          req.user.id,
        ],
      );

      // Fetch the created ebook
      const [ebooks] = await pool.query(
        `SELECT e.*, CONCAT(u.firstname, ' ', u.lastname) as uploader_name 
       FROM ebooks e 
       JOIN users u ON e.uploaded_by = u.id 
       WHERE e.id = ?`,
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
      if (req.files && req.files["ebook"] && req.files["ebook"][0]) {
        try {
          fs.unlinkSync(req.files["ebook"][0].path);
        } catch (e) {}
      }
      if (req.files && req.files["cover"] && req.files["cover"][0]) {
        try {
          fs.unlinkSync(req.files["cover"][0].path);
        } catch (e) {}
      }

      res
        .status(500)
        .json(
          createResponse(false, "Server error during upload: " + error.message),
        );
    }
  },
);

// Get user's own ebooks (PROTECTED)
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
// PARAM ROUTES
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

    if (fs.existsSync(ebook.file_path)) {
      fs.unlinkSync(ebook.file_path);
      console.log("🗑️ Deleted PDF:", ebook.file_path);
    }

    if (ebook.cover_image_path && fs.existsSync(ebook.cover_image_path)) {
      fs.unlinkSync(ebook.cover_image_path);
      console.log("🗑️ Deleted cover:", ebook.cover_image_path);
    }

    await pool.query("DELETE FROM ebooks WHERE id = ?", [req.params.id]);
    res.json(createResponse(true, "eBook deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json(createResponse(false, "Server error"));
  }
});

export default router;
