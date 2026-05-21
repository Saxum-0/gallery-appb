const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

// 🔥 expose le dossier public
app.use("/public", express.static(path.join(__dirname, "public")));

// 📡 API photos dynamique (garde les vrais noms)
app.get("/photos", (req, res) => {
  const folderPath = path.join(__dirname, "public/photos");

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lecture dossier" });
    }

    const photos = files
      .filter(file =>
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".png") ||
        file.endsWith(".webp")
      )
      .map((file, index) => ({
        id: index,
        name: file, // 👈 tu gardes IMG_0045.jpg
        url: `http://localhost:3000/public/photos/${file}`,
      }));

    res.json(photos);
  });
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});