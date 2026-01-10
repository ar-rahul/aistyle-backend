import { analyzeArchitecture } from "../services/ai.service.js";
import Image from "../models/Image.js";
import { uploadImage } from "../services/storage.service.js";
import { embedText } from "../services/embedding.service.js";
import SurveyResult from "../models/SurveyResult.js";


/* ============================
   List all survey reports
============================ */
export async function listSurveys(req, res) {
  try {
    const surveys = await SurveyResult.find(
      {},
      {
        name: 1,
        meta: 1,
        createdAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    res.json(surveys);
  } catch (err) {
    console.error("❌ listSurveys:", err);
    res.status(500).json({ error: "Failed to load surveys" });
  }
}

/* ============================
   Get one survey report
============================ */
export async function getSurvey(req, res) {
  try {
    const survey = await SurveyResult.findById(req.params.id).lean();

    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.json(survey);
  } catch (err) {
    console.error("❌ getSurvey:", err);
    res.status(500).json({ error: "Failed to load survey" });
  }
}



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
  analyzed: false,
  analysis: {
    space_category: "living" // temporary placeholder
  }
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

          if (!analysis.space_category) {
  analysis.space_category = "living";
}

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

