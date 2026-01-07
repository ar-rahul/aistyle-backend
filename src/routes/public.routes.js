import express from "express";
import { submitSurvey } from "../controllers/public.controller.js";

const router = express.Router();

router.post("/submit", submitSurvey);

export default router;
