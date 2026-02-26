// server/pdfCoverExtractor.js
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { createCanvas } from "canvas";
// pdfjs-dist is dynamically imported below so the server starts even without it

/**
 * Renders the first page of a PDF to a JPEG cover image.
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
    const SCALE = 1.5;
    const viewport = page.getViewport({ scale: SCALE });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

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

    coverBuffer = canvas.toBuffer("image/jpeg");
    console.log("✅ PDF first page rendered for:", filename);
  } catch (err) {
    console.warn("⚠️  PDF rendering failed, using placeholder:", err.message);
    coverBuffer = null;
  }

  // ── Fallback: styled placeholder ────────────────────────────────────────
  if (!coverBuffer) {
    const canvas = createCanvas(400, 560);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 400, 560);
    gradient.addColorStop(0, "#1e3a5f");
    gradient.addColorStop(1, "#2563eb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 560);

    // Subtle circle pattern
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(200, 280, 60 + i * 35, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Book icon area
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.roundRect(150, 160, 100, 130, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📄", 200, 248);

    // Title text
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#ffffff";
    const displayTitle = filename.replace(/[-_]/g, " ");
    const words = displayTitle.split(" ");
    let line = "";
    let y = 330;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 340 && line) {
        ctx.fillText(line.trim(), 200, y);
        line = word + " ";
        y += 32;
        if (y > 420) break;
      } else {
        line = test;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), 200, y);

    // Footer
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("OCC Digital Library", 200, 520);

    coverBuffer = canvas.toBuffer("image/jpeg");
  }

  // ── Save with sharp ─────────────────────────────────────────────────────
  await sharp(coverBuffer)
    .resize(300, 420, { fit: "cover", position: "top" })
    .jpeg({ quality: 88 })
    .toFile(outputPath);

  console.log("✅ Cover saved:", outputFilename);
  return outputPath;
};
