import ClassSchedule from "../models/ClassSchedule.js";
import Venue from "../models/Venue.js";
import { parseTimeToMinutes } from "../utils/time.js";

const scheduleFields = [
  "source",
  "program",
  "semester",
  "batch",
  "dayOfWeek",
  "startTime",
  "endTime",
  "courseCode",
  "courseName",
  "facultyName",
  "roomNo",
  "rawText",
  "isCancelled"
];

const venueFields = ["name", "building", "type", "capacity", "notes"];

const pickFields = (fields, body) =>
  Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

const withMinutes = (data) => {
  const next = { ...data };
  if (next.startTime) next.startMinutes = parseTimeToMinutes(next.startTime);
  if (next.endTime) next.endMinutes = parseTimeToMinutes(next.endTime);
  return next;
};

export const getAdminSummary = async (req, res) => {
  const [scheduleCount, venueCount, batches] = await Promise.all([
    ClassSchedule.countDocuments({}),
    Venue.countDocuments({}),
    ClassSchedule.distinct("batch")
  ]);

  res.json({ scheduleCount, venueCount, batches });
};

export const listSchedules = async (req, res) => {
  const filter = {};
  if (req.query.roomNo) filter.roomNo = req.query.roomNo;
  if (req.query.batch) filter.batch = req.query.batch;
  if (req.query.day) filter.dayOfWeek = String(req.query.day).toLowerCase();

  const schedules = await ClassSchedule.find(filter).sort({ dayOfWeek: 1, startMinutes: 1 }).limit(300).lean();
  res.json({ schedules });
};

export const createSchedule = async (req, res) => {
  const schedule = await ClassSchedule.create(withMinutes(pickFields(scheduleFields, req.body)));
  res.status(201).json({ message: "Schedule created", schedule });
};

export const updateSchedule = async (req, res) => {
  const schedule = await ClassSchedule.findByIdAndUpdate(req.params.id, withMinutes(pickFields(scheduleFields, req.body)), {
    new: true,
    runValidators: true
  });

  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Schedule updated", schedule });
};

export const deleteSchedule = async (req, res) => {
  const schedule = await ClassSchedule.findByIdAndDelete(req.params.id);
  if (!schedule) return res.status(404).json({ message: "Schedule not found" });
  res.json({ message: "Schedule deleted" });
};

export const upsertVenue = async (req, res) => {
  const data = pickFields(venueFields, req.body);
  const venue = await Venue.findOneAndUpdate({ name: data.name }, data, { upsert: true, new: true, runValidators: true });
  res.status(201).json({ message: "Venue saved", venue });
};
