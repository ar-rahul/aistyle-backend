import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    console.log("📦 Connected DB name:", mongoose.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}
