// server/pdfCoverExtractor.js
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { createCanvas } from "canvas";
// pdfjs-dist is dynamically imported below so the server starts even without it

/**
 * Renders the first page of a PDF to a JPEG cover image with better quality.
 * Falls back to a styled placeholder if pdfjs-dist is missing or rendering fails.
 */
export const extractCoverFromPDF = async (pdfPath, outputDir) => {
  const filename = path.basename(pdfPath, path.extname(pdfPath));
  const uniqueId = uuidv4();
  const outputFilename = `cover-${filename}-${uniqueId}.jpg`;
  const outputPath = path.join(outputDir, outputFilename);

  let coverBuffer = null;

  // ── Try real PDF rendering with pdfjs-dist ──────────────────────────────
  try {
    // Dynamic import — server still starts if pdfjs-dist is not installed
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Disable worker thread in Node.js environment (no browser workers in Node)
    pdfjsLib.GlobalWorkerOptions.workerSrc = false;

    const pdfBytes = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(pdfBytes);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    }).promise;

    const page = await pdf.getPage(1);
    // Use higher scale for better quality (match client-side: 1.5)
    const SCALE = 1.5;
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    // Fill with white background first
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // node-canvas factory required by pdfjs in Node.js
    const canvasFactory = {
      create(width, height) {
        const c = createCanvas(width, height);
        return { canvas: c, context: c.getContext("2d") };
      },
      reset(pair, width, height) {
        pair.canvas.width = width;
        pair.canvas.height = height;
      },
      destroy(pair) {
        pair.canvas.width = 0;
        pair.canvas.height = 0;
      },
    };

    await page.render({
      canvasContext: ctx,
      viewport,
      canvasFactory,
      background: "white",
    }).promise;

    coverBuffer = canvas.toBuffer("image/jpeg", { quality: 85 });
    console.log("✅ PDF first page rendered for:", filename);
  } catch (err) {
    console.warn("⚠️  PDF rendering failed, using placeholder:", err.message);
    coverBuffer = null;
  }

  // ── Fallback: styled placeholder ────────────────────────────────────────
  if (!coverBuffer) {
    const canvas = createCanvas(400, 560);
    const ctx = canvas.getContext("2d");

    // Create a more professional gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 560);
    gradient.addColorStop(0, "#1e3a5f");
    gradient.addColorStop(1, "#2563eb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 560);

    // Subtle pattern
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(200, 280, 40 + i * 35, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Book icon
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.rect(160, 170, 80, 100);
    ctx.fill();

    // Book spine
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(150, 170, 10, 100);

    // PDF icon text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px 'Arial', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PDF", 200, 240);

    // Title text (truncated)
    ctx.font = "bold 18px 'Arial', sans-serif";
    ctx.fillStyle = "#ffffff";
    const displayTitle = filename.replace(/[-_]/g, " ").substring(0, 30).trim();

    // Wrap text
    const words = displayTitle.split(" ");
    let line = "";
    let y = 310;
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 300 && line.length > 0) {
        ctx.fillText(line.trim(), 200, y);
        line = word + " ";
        y += 25;
        if (y > 380) break;
      } else {
        line = testLine;
      }
    }
    if (line.trim() && y <= 380) {
      ctx.fillText(line.trim(), 200, y);
    }

    // Footer
    ctx.font = "12px 'Arial', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("OCC Digital Library", 200, 500);

    coverBuffer = canvas.toBuffer("image/jpeg", { quality: 85 });
  }

  // ── Save with sharp - use dimensions that match client-side preview ─────
  await sharp(coverBuffer)
    .resize(300, 420, {
      fit: "cover",
      position: "top",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);

  console.log("✅ Cover saved:", outputFilename);
  return outputPath;
};
