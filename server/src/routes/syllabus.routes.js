import express from "express";
import { getSyllabusDocuments } from "../controllers/syllabus.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getSyllabusDocuments);

export default router;
