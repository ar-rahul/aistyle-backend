import { analyzeArchitecture } from "../services/ai.service.js";
import Image from "../models/Image.js";
import { uploadImage } from "../services/storage.service.js";
import { embedText } from "../services/embedding.service.js";
import SurveyResult from "../models/SurveyResult.js";


export async function listSurveys(req, res) {
  const { name, from, to, limit = 20 } = req.query;

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const results = await SurveyResult
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(results);
}


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
