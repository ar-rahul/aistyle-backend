import SurveyResult from "../models/SurveyResult.js";

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
