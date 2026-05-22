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

app.get("/photo/:name", async (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }
  try {
    const image = sharp(filePath);
    const { width, height } = await image.metadata();

    // Watermark SVG simple, sans pattern
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
          font-size="48" fill="white" opacity="0.25" font-family="Arial"
          transform="rotate(-30, ${width/2}, ${height/2})">
          Pixel Flow
        </text>
      </svg>`;

    const buffer = await image
      .composite([{ input: Buffer.from(svgText), blend: "over" }])
      .jpeg()
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buffer);

  } catch (err) {
    console.error("Sharp error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));