const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const app = express();

app.use(cors());

app.get("/photos", (req, res) => {
  const folder = path.join(__dirname, "public/photos");
  fs.readdir(folder, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read folder" });
    const photos = files
      .filter((f) => f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".webp"))
      .map((file, index) => ({
        id: index,
        name: file,
        url: `https://gallery-appb.onrender.com/photo/${file}`
      }));
    res.json(photos);
  });
});

app.get("/test/:name", (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);
  const exists = fs.existsSync(filePath);
  res.json({ file: req.params.name, exists, path: filePath });
});

app.get("/photo/:name", async (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }
  try {
    const image = sharp(filePath);
    const { width, height, format } = await image.metadata();
    const cols = Math.ceil(width / 300);
    const rows = Math.ceil(height / 200);
    let texts = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * 300;
        const y = r * 200 + 50;
        texts += `<text x="${x}" y="${y}" font-size="28" fill="white" opacity="0.15" font-family="Arial" transform="rotate(-30, ${x}, ${y})">Pixel Flow</text>`;
      }
    }
    const watermarkSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
    const mimeTypes = { jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
    const contentType = mimeTypes[format] || "image/jpeg";
    const buffer = await image
      .composite([{ input: Buffer.from(watermarkSvg), blend: "over" }])
      .toBuffer();
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err) {
    console.error("Sharp error:", err);
    res.status(500).json({ error: "Failed to process image", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));