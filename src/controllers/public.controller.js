import SurveyResult from "../models/SurveyResult.js";
import Image from "../models/Image.js";


export async function submitSurvey(req, res) {
  try {
    const { name, report, meta } = req.body;

    /* --------------------
       Basic validation
    -------------------- */
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!report || typeof report !== "object") {
      return res.status(400).json({ error: "Report is required" });
    }

    /* --------------------
       Save to DB
    -------------------- */
    const result = await SurveyResult.create({
      name: name.trim(),
      report,
      meta
    });

    return res.status(201).json({
      success: true,
      id: result._id
    });
  } catch (err) {
    console.error("❌ submitSurvey error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function listPublicImages(req, res) {
  try {
    const images = await Image.find(
      {}, // ← no filter until you add visibility properly
      {
        imageUrl: 1,
        analysis: 1
      }
    ).lean();

    res.json(images);
  } catch (err) {
    console.error("❌ listPublicImages:", err);
    res.status(500).json({ error: "Failed to load images" });
  }
}
