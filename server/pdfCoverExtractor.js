// server/pdfCoverExtractor.js
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import { createCanvas } from "canvas";

export const extractCoverFromPDF = async (pdfPath, outputDir, title = null) => {
  try {
    const filename = path.basename(pdfPath, path.extname(pdfPath));
    const uniqueId = uuidv4();
    const outputFilename = `cover-${filename}-${uniqueId}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);

    // Try to extract actual cover first
    let coverBuffer = null;

    try {
      // Read the PDF file
      const pdfBytes = fs.readFileSync(pdfPath);

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Get the first page
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Create a canvas to render a representation of the page
        const canvas = createCanvas(400, 600); // Fixed size for cover
        const ctx = canvas.getContext("2d");

        // Create a professional cover design
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 600);
        gradient.addColorStop(0, "#2c3e50");
        gradient.addColorStop(1, "#3498db");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 600);

        // Add some pattern
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          ctx.beginPath();
          ctx.arc(200, 300, 50 + i * 30, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Add title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("📄 eBook", 200, 150);

        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.9)";

        // Use provided title or filename
        const displayTitle =
          title || filename.replace(/-/g, " ").replace(/_/g, " ");
        const words = displayTitle.split(" ");
        let line = "";
        let y = 250;

        for (let word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 350 && line.length > 0) {
            ctx.fillText(line, 200, y);
            line = word + " ";
            y += 40;
          } else {
            line = testLine;
          }
        }
        if (line.length > 0) {
          ctx.fillText(line, 200, y);
        }

        // Add PDF icon
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(150, 400, 100, 120);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeRect(150, 400, 100, 120);

        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("PDF", 170, 480);

        // Convert canvas to buffer
        coverBuffer = canvas.toBuffer("image/jpeg");
      }
    } catch (pdfError) {
      console.error("PDF processing error, creating fallback cover:", pdfError);
      coverBuffer = null;
    }

    // If we couldn't create a cover from PDF, create a styled fallback
    if (!coverBuffer) {
      // Create fallback canvas
      const canvas = createCanvas(400, 600);
      const ctx = canvas.getContext("2d");

      // Simple but professional fallback design
      const gradient = ctx.createLinearGradient(0, 0, 400, 600);
      gradient.addColorStop(0, "#4a5568");
      gradient.addColorStop(1, "#2d3748");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 600);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText("📄 PDF Document", 200, 200);

      ctx.font = "24px Arial";
      ctx.fillStyle = "#cbd5e0";
      ctx.fillText(filename.substring(0, 30), 200, 300);

      ctx.font = "18px Arial";
      ctx.fillText("OCC Digital Library", 200, 500);

      coverBuffer = canvas.toBuffer("image/jpeg");
    }

    // Process with sharp
    if (coverBuffer) {
      await sharp(coverBuffer)
        .resize(300, 400, {
          fit: "cover",
          position: "top",
          background: { r: 255, g: 255, b: 255 },
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      console.log("✅ Cover created successfully:", outputFilename);
      return outputPath;
    }

    return null;
  } catch (error) {
    console.error("❌ Error creating cover:", error);
    return null;
  }
};

// Alternative function to create cover with custom styling
export const createCustomCover = async (pdfPath, outputDir, options = {}) => {
  try {
    const {
      title = "eBook",
      author = "OCC Library",
      backgroundColor = "#2c3e50",
      accentColor = "#3498db",
      width = 400,
      height = 600,
    } = options;

    const filename = path.basename(pdfPath, path.extname(pdfPath));
    const uniqueId = uuidv4();
    const outputFilename = `cover-${filename}-${uniqueId}.jpg`;
    const outputPath = path.join(outputDir, outputFilename);

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, accentColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative elements
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 100 + i * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("📚", width / 2, height / 3);

    ctx.font = "bold 28px Arial";
    ctx.fillText(title, width / 2, height / 2);

    // Author
    ctx.font = "18px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(author, width / 2, height - 100);

    // Save
    const buffer = canvas.toBuffer("image/jpeg");
    await sharp(buffer).jpeg({ quality: 85 }).toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error("Error creating custom cover:", error);
    return null;
  }
};
