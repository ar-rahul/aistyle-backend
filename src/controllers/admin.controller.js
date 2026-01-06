import { analyzeArchitecture } from "../services/ai.service.js";
import Image from "../models/Image.js";
import { uploadImage } from "../services/storage.service.js";
import { embedText } from "../services/embedding.service.js";

export async function uploadImageController(req, res) {
  try {
    const { buffer, originalname } = req.file;

    const { imageUrl, storagePath, hash } = await uploadImage(
      buffer,
      originalname
    );

    console.log("📤 Upload endpoint hit:", originalname);

    // Deduplication
    let image = await Image.findOne({ hash });
    if (image) {
      return res.json(image);
    }

    // Create base record first
    image = await Image.create({
      imageUrl,
      storagePath,
      hash,
      analyzed: false
    });

    // Respond early (fast UI)
    res.json(image);

    /* ----------------------------------------
       Background processing (AI + embeddings)
       ---------------------------------------- */

    try {
      const analysis = await analyzeArchitecture(imageUrl);

      /* ---- Generate embeddings ---- */

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

      /* ---- Persist everything ---- */

      image.analysis = analysis;
      image.embeddings = {
        variant: variantEmbedding,
        philosophy: philosophyEmbedding,
        colors: colorEmbeddings
      };
      image.analyzed = true;

      await image.save();

      console.log("✅ AI + embeddings saved for image:", image._id);
    } catch (err) {
      console.error("❌ Background AI/embedding failed:", err.message);
    }

  } catch (err) {
    console.error("❌ Upload controller failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
}
