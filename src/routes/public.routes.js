import express from "express";
import { submitSurvey } from "../controllers/public.controller.js";
import { listPublicImages } from "../controllers/public.controller.js";


const router = express.Router();

router.post("/submit", submitSurvey);

router.get("/images", listPublicImages);


export default router;
