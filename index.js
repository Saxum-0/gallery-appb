const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");

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
    const image = await Jimp.read(filePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // Watermark répété en grille
    const w = image.getWidth();
    const h = image.getHeight();
    for (let y = 0; y < h; y += 200) {
      for (let x = 0; x < w; x += 300) {
        image.print(font, x, y, "Pixel Flow");
      }
    }

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buffer);

  } catch (err) {
    console.error("Jimp error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));