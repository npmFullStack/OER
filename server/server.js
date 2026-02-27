// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./authRoutes.js";
import ebookRoutes from "./ebookRoutes.js";
import { initializeDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORRECTED PATHS based on your logs
const SERVER_UPLOADS_PATH = path.join(__dirname, "uploads"); // /home/opol/OER/server/uploads
const PROJECT_ROOT = path.join(__dirname, "..", ".."); // Go up two levels to /home/opol
const ACTUAL_UPLOADS_PATH = path.join(PROJECT_ROOT, "uploads"); // /home/opol/uploads

console.log("📁 Static file serving locations:");
console.log("  - Server uploads (legacy):", SERVER_UPLOADS_PATH);
console.log("  - Actual uploads (active):", ACTUAL_UPLOADS_PATH);

// Check if directories exist
console.log("📊 Directory status:");
console.log("  - Server uploads exists:", fs.existsSync(SERVER_UPLOADS_PATH));
console.log("  - Actual uploads exists:", fs.existsSync(ACTUAL_UPLOADS_PATH));

// Serve uploaded files statically from BOTH locations
app.use("/uploads", express.static(SERVER_UPLOADS_PATH));
app.use("/uploads", express.static(ACTUAL_UPLOADS_PATH));

// Add CORS headers for images
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
  },
  express.static(SERVER_UPLOADS_PATH),
  express.static(ACTUAL_UPLOADS_PATH),
);

// Debug route to check if files exist
app.get("/api/debug/cover/:filename", (req, res) => {
  const { filename } = req.params;

  // Check both locations
  const serverCoverPath = path.join(SERVER_UPLOADS_PATH, "covers", filename);
  const actualCoverPath = path.join(ACTUAL_UPLOADS_PATH, "covers", filename);

  const exists = {
    server: {
      path: serverCoverPath,
      exists: fs.existsSync(serverCoverPath),
    },
    actual: {
      path: actualCoverPath,
      exists: fs.existsSync(actualCoverPath),
    },
    url: `/uploads/covers/${filename}`,
    fullUrl: `http://192.168.254.106:${PORT}/uploads/covers/${filename}`,
  };

  res.json(exists);
});

// Debug route to check all paths
app.get("/api/debug/paths", (req, res) => {
  res.json({
    serverUploads: {
      path: SERVER_UPLOADS_PATH,
      exists: fs.existsSync(SERVER_UPLOADS_PATH),
      covers: fs.existsSync(path.join(SERVER_UPLOADS_PATH, "covers"))
        ? fs.readdirSync(path.join(SERVER_UPLOADS_PATH, "covers"))
        : [],
    },
    actualUploads: {
      path: ACTUAL_UPLOADS_PATH,
      exists: fs.existsSync(ACTUAL_UPLOADS_PATH),
      covers: fs.existsSync(path.join(ACTUAL_UPLOADS_PATH, "covers"))
        ? fs.readdirSync(path.join(ACTUAL_UPLOADS_PATH, "covers"))
        : [],
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ebooks", ebookRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    serverUploadsPath: SERVER_UPLOADS_PATH,
    actualUploadsPath: ACTUAL_UPLOADS_PATH,
    port: PORT,
  });
});

// Initialize database then start server
initializeDatabase().then((success) => {
  if (!success) {
    console.error("Database initialization failed. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Server uploads directory: ${SERVER_UPLOADS_PATH}`);
    console.log(`📁 Actual uploads directory: ${ACTUAL_UPLOADS_PATH}`);
    console.log(
      `🔍 Test image URL: http://192.168.254.106:${PORT}/uploads/covers/test.jpg`,
    );
  });
});
