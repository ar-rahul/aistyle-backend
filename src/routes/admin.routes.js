import express from "express";
import multer from "multer";
import Image from "../models/Image.js";
import { uploadImageController } from "../controllers/admin.controller.js";
import { deleteFromFirebase } from "../services/storage.service.js";
import { adminAuth } from "../middleware/adminAuth.js";



const router = express.Router();
const upload = multer();


router.use(adminAuth); 


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
      console.log("⚠️ Image not found in DB");
      return res.status(404).json({ error: "Image not found" });
    }

    console.log("📦 Image document:", {
      id: image._id,
      storagePath: image.storagePath,
      imageUrl: image.imageUrl
    });

    // 🔥 Firebase delete (NON-BLOCKING)
    if (image.storagePath) {
      try {
        await deleteFromFirebase(image.storagePath);
        console.log("🗑️ Firebase file deleted");
      } catch (err) {
        console.error("⚠️ Firebase delete failed:", err.message);
      }
    } else {
      console.warn("⚠️ No storagePath found, skipping Firebase delete");
    }

    // ✅ ALWAYS delete DB record
    await Image.deleteOne({ _id: image._id });
    console.log("✅ MongoDB record deleted");

    res.json({ success: true });

  } catch (err) {
    console.error("❌ DELETE ROUTE CRASHED:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});


router.post("/taste/update", async (req, res) => {
  const { selectedId, rejectedId, tasteVector } = req.body;

  const selected = await Image.findById(selectedId);
  const rejected = rejectedId
    ? await Image.findById(rejectedId)
    : null;

  // combine vectors here (cosine-weighted)
  // return updated tasteVector

  res.json(updatedTasteVector);
});



export default router;
