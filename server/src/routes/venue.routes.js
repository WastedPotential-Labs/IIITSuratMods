import express from "express";
import { findFreeRooms, getVenue, listVenues } from "../controllers/venue.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(listVenues));
router.get("/free", asyncHandler(findFreeRooms));
router.get("/:name", asyncHandler(getVenue));

export default router;
