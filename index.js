const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const app = express();

app.use(cors());

// ❌ On ne sert plus les fichiers directement
// app.use("/public", express.static(path.join(__dirname, "public")));

// 📡 GET : liste des photos
app.get("/photos", (req, res) => {
  const folder = path.join(__dirname, "public/photos");

  fs.readdir(folder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Cannot read folder" });
    }

    const photos = files
      .filter((f) =>
        f.endsWith(".jpg") ||
        f.endsWith(".png") ||
        f.endsWith(".webp")
      )
      .map((file, index) => ({
        id: index,
        name: file,
        url: `https://gallery-appb.onrender.com/photo/${file}`
      }));

    res.json(photos);
  });
});

// 🖼️ GET : image protégée + watermark
app.get("/photo/:name", async (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);

  try {
    const image = sharp(filePath);
    const { width, height } = await image.metadata();

    // 🔥 watermark diagonal répété
    const watermarkSvg = `
      <svg width="${width}" height="${height}">
        <defs>
          <pattern id="wm" patternUnits="userSpaceOnUse" width="300" height="200" patternTransform="rotate(-30)">
            <text x="0" y="50"
              font-size="28"
              fill="white"
              opacity="0.12"
              font-family="Arial">
              Pixel Flow
            </text>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#wm)" />
      </svg>
    `;

    const buffer = await image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          blend: "over"
        }
      ])
      .toBuffer();

    res.set("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (err) {
    res.status(404).json({ error: "Image not found" });
  }
});

// ⚠️ Render port obligatoire
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});