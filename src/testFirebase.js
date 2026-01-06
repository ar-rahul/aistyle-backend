import { bucket } from "./config/firebase.js";

async function test() {
  const file = bucket.file("test.txt");
  await file.save("Firebase connected!");
  console.log("Upload successful:", file.publicUrl());
}

test();
