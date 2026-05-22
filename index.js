// 🖼️ GET : image protégée + watermark
app.get("/photo/:name", async (req, res) => {
  const filePath = path.join(__dirname, "public/photos", req.params.name);

  // Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  try {
    const image = sharp(filePath);
    const { width, height, format } = await image.metadata();

    // ✅ Watermark SANS pattern (librsvg le gère mal)
    // On répète manuellement le texte en grille
    const cols = Math.ceil(width / 300);
    const rows = Math.ceil(height / 200);

    let texts = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * 300;
        const y = r * 200 + 50;
        texts += `
          <text 
            x="${x}" y="${y}"
            font-size="28"
            fill="white"
            opacity="0.15"
            font-family="Arial"
            transform="rotate(-30, ${x}, ${y})">
            Pixel Flow
          </text>`;
      }
    }

    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${texts}
      </svg>
    `;

    // ✅ Content-Type dynamique selon le format réel
    const mimeTypes = {
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    const contentType = mimeTypes[format] || "image/jpeg";

    const buffer = await image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          blend: "over",
        },
      ])
      .toBuffer();

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400"); // cache 1 jour
    res.send(buffer);

  } catch (err) {
    console.error("Sharp error:", err); // ← tu verras l'erreur dans les logs Render
    res.status(500).json({ error: "Failed to process image", detail: err.message });
  }
});