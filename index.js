const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

app.get("/photo/:name", (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));