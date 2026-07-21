import express from "express";
import {
  createNotification,
  deleteNotification,
  listNotifications,
  listPublicNotifications,
  updateNotification
} from "../controllers/notification.controller.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(listPublicNotifications));
router.get("/admin", protect, requireAdmin, asyncHandler(listNotifications));
router.post("/", protect, requireAdmin, asyncHandler(createNotification));
router.put("/:id", protect, requireAdmin, asyncHandler(updateNotification));
router.delete("/:id", protect, requireAdmin, asyncHandler(deleteNotification));

export default router;
