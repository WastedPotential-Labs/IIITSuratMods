import TimetableSlot from "../models/TimetableSlot.js";
import { parseTimeToMinutes } from "../utils/time.js";

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// startTime is stored as a string, so a Mongo sort puts "10:00" before "9:00".
// Sort in JS on parsed minutes instead.
const byStartTime = (a, b) => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0);

const weekOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const byDayThenTime = (a, b) =>
  weekOrder.indexOf(a.dayOfWeek) - weekOrder.indexOf(b.dayOfWeek) || byStartTime(a, b);

const slotFields = ["dayOfWeek", "startTime", "endTime", "courseCode", "courseName", "facultyName", "roomNo", "slotType", "isCancelled"];

const pickSlotFields = (body) =>
  Object.fromEntries(slotFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

export const getTodayTimetable = async (req, res) => {
  try {
    const day = dayNames[new Date().getDay()];
    const classes = await TimetableSlot.find({
      user: req.user._id,
      dayOfWeek: day,
      isCancelled: false
    }).lean();
    classes.sort(byStartTime);

    return res.json({ day, classes });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load today's timetable" });
  }
};

export const getWeeklyTimetable = async (req, res) => {
  try {
    const slots = await TimetableSlot.find({ user: req.user._id }).lean();
    slots.sort(byDayThenTime);
    return res.json({ slots });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load weekly timetable" });
  }
};

export const createSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.create({ user: req.user._id, ...pickSlotFields(req.body) });
    return res.status(201).json({ message: "Timetable slot created", slot });
  } catch (error) {
    return res.status(400).json({ message: "Invalid timetable slot data" });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      pickSlotFields(req.body),
      { new: true, runValidators: true }
    );

    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }

    return res.json({ message: "Timetable slot updated", slot });
  } catch (error) {
    return res.status(400).json({ message: "Invalid timetable slot data" });
  }
};

export const deleteSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }

    return res.json({ message: "Timetable slot deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid timetable slot id" });
  }
};
