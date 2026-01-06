/* eslint-env node */

import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

console.log("OpenAI key loaded:", !!process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json());

// IMPORTANT: await DB connection
await connectDB();

// routes
app.use("/admin", adminRoutes);

// health check
app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
