export async function uploadImageController(req, res) {
  try {
    const files = req.files ?? (req.file ? [req.file] : []);

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log(`📤 Upload endpoint hit: ${files.length} file(s)`);

    const createdImages = [];

    // ---------- FAST PATH: upload + DB create ----------
    for (const file of files) {
      const { buffer, originalname } = file;

      const { imageUrl, storagePath, hash } =
        await uploadImage(buffer, originalname);

      // Deduplication
      let image = await Image.findOne({ hash });
      if (image) {
        createdImages.push(image);
        continue;
      }

      image = await Image.create({
        imageUrl,
        storagePath,
        hash,
        analyzed: false
      });

      createdImages.push(image);

      // ---------- BACKGROUND AI PROCESS ----------
      (async () => {
        try {
          const analysis = await analyzeArchitecture(imageUrl);

          const variantEmbedding = analysis.variant
            ? await embedText(analysis.variant)
            : null;

          const philosophyEmbedding = analysis.design_philosophy
            ? await embedText(analysis.design_philosophy)
            : null;

          const colorEmbeddings = Array.isArray(analysis.color_keywords)
            ? await Promise.all(
                analysis.color_keywords.map(embedText)
              )
            : [];

          image.analysis = analysis;
          image.embeddings = {
            variant: variantEmbedding,
            philosophy: philosophyEmbedding,
            colors: colorEmbeddings
          };
          image.analyzed = true;

          await image.save();

          console.log(
            "✅ AI + embeddings saved for image:",
            image._id
          );
        } catch (err) {
          console.error(
            "❌ Background AI/embedding failed:",
            err.message
          );
        }
      })();
    }

    // ---------- RESPOND IMMEDIATELY ----------
    res.json({
      success: true,
      count: createdImages.length,
      images: createdImages
    });

  } catch (err) {
    console.error("❌ Upload controller failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}
