import crypto from "crypto";
import { bucket } from "../config/firebase.js";
import admin from "firebase-admin";


export async function uploadImage(buffer, filename) {
  const hash = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");

  const storagePath = `images/${hash}-${filename}`;

  const file = bucket.file(storagePath);

  await file.save(buffer, {
    metadata: { contentType: "image/jpeg" },
    public: true
  });

  return {
    imageUrl: file.publicUrl(),
    storagePath,  
    hash
  };
}

export async function deleteFromFirebase(storagePath) {
  const bucket = admin.storage().bucket();

  console.log("🗑️ Attempting Firebase delete:", storagePath);

  await bucket.file(storagePath).delete();
}
