import "../bootstrap/env.js"; // ensures dotenv loads FIRST
import admin from "firebase-admin";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env variable");
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

const bucket = admin.storage().bucket();

export { admin, bucket };
