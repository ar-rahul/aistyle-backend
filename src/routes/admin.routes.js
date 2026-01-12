import express from "express";
import multer from "multer";

import Image from "../models/Image.js";
import { uploadImageController } from "../controllers/admin.controller.js";
import { listSurveys, getSurvey } from "../controllers/admin.controller.js";
import { deleteFromFirebase } from "../services/storage.service.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { updateImageVisibility } from "../controllers/admin.controller.js";


const router = express.Router();
const upload = multer();

/* =========================
   GLOBAL ADMIN AUTH
========================= */
router.use(adminAuth);

/* =========================
   SURVEY REPORTS
========================= */
router.get("/surveys", listSurveys);
router.get("/surveys/:id", getSurvey);

/* =========================
   IMAGE MANAGEMENT
========================= */

// upload image
router.post("/upload", upload.single("image"), uploadImageController);

// list images
router.get("/images", async (req, res) => {
  const images = await Image.find().sort({ createdAt: -1 });
  res.json(images);
});

// delete image
router.delete("/images/:id", async (req, res) => {
  console.log("🧨 Delete request for:", req.params.id);

  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    if (image.storagePath) {
      try {
        await deleteFromFirebase(image.storagePath);
      } catch (err) {
        console.error("⚠️ Firebase delete failed:", err.message);
      }
    }

    await Image.deleteOne({ _id: image._id });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE ROUTE CRASHED:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});


/* =========================
   VISIBILITY CONTROL
========================= */

// toggle visibility
router.patch("/images/:id/visibility", updateImageVisibility);

// visible-only images (for VisibilityPage)
router.get("/images-visible", async (req, res) => {
  const images = await Image.find({ isVisible: true })
    .sort({ createdAt: -1 });

  res.json(images);
});

export default router;
