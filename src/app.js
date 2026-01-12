/* eslint-env node */

import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import { connectDB } from "./config/db.js";
import cors from "cors";

import publicRoutes from "./routes/public.routes.js";



dotenv.config();

console.log("OpenAI key loaded:", !!process.env.OPENAI_API_KEY);

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://adminui.architectureinterface.in",
    "https://aistyle-client.pages.dev",
    "https://styles.architectureinterface.in",
    "https://aiadmin.architectureinterface.in"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "x-admin-key",
    "Authorization"
  ],
}));

app.use(express.json());

app.use("/public", publicRoutes);

await connectDB();

app.use("/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
