//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)


import express from "express";
import { getMe, login, register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();//mini router to handle auth related routes

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
