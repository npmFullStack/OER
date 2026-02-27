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

// Serve uploaded files statically
const uploadsPath = path.join(__dirname, "uploads");
console.log("Serving static files from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));

// Add CORS headers for images
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    next();
  },
  express.static(uploadsPath),
);

// Debug route to check if files exist
app.get("/api/debug/cover/:filename", (req, res) => {
  const { filename } = req.params;
  const coverPath = path.join(uploadsPath, "covers", filename);
  const ebookPath = path.join(uploadsPath, "ebooks", filename);

  const exists = {
    cover: fs.existsSync(coverPath),
    ebook: fs.existsSync(ebookPath),
    coverPath,
    ebookPath,
    url: `/uploads/covers/${filename}`,
    fullUrl: `http://192.168.254.106:${PORT}/uploads/covers/${filename}`,
  };

  res.json(exists);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ebooks", ebookRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    uploadsPath: uploadsPath,
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
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${uploadsPath}`);
    console.log(
      `Test image URL: http://192.168.254.106:${PORT}/uploads/covers/test.jpg`,
    );
  });
});
