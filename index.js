const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

// 🔥 expose le dossier public
app.use("/public", express.static(path.join(__dirname, "public")));

// 📡 API auto depuis dossier
app.get("/photos", (req, res) => {
  const folder = path.join(__dirname, "public/photos");

  fs.readdir(folder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Cannot read folder" });
    }

    const photos = files
      .filter(f =>
        f.endsWith(".jpg") ||
        f.endsWith(".png") ||
        f.endsWith(".webp")
      )
      .map((file, index) => ({
        id: index,
        name: file,
        url: `https://gallery-appb.onrender.com/public/photos/${file}`
      }));

    res.json(photos);
  });
});

// ⚠️ IMPORTANT Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});