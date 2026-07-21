import ClassSchedule from "../models/ClassSchedule.js";
import Notification from "../models/Notification.js";
import Venue from "../models/Venue.js";
import { days, formatMinutes, overlaps, parseTimeToMinutes } from "../utils/time.js";

const jsDayToName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const dateToMinutes = (date) => date.getHours() * 60 + date.getMinutes();

const buildVenueFallbacks = async () => {
  const rooms = await ClassSchedule.distinct("roomNo", { isCancelled: false });
  return rooms.map((name) => ({ name, type: /lab/i.test(name) ? "lab" : "classroom" }));
};

const getAllVenues = async () => {
  const stored = await Venue.find({}).sort({ name: 1 }).lean();
  if (stored.length) return stored;
  return buildVenueFallbacks();
};

export const listVenues = async (req, res) => {
  const query = String(req.query.q || "").trim().toLowerCase();
  const venues = await getAllVenues();
  const filtered = query
    ? venues.filter((venue) => [venue.name, venue.building, venue.notes].filter(Boolean).join(" ").toLowerCase().includes(query))
    : venues;

  res.json({ venues: filtered.slice(0, 100) });
};

export const getVenue = async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const venue = (await Venue.findOne({ name }).lean()) || { name, type: /lab/i.test(name) ? "lab" : "classroom" };
  const schedules = await ClassSchedule.find({ roomNo: name, isCancelled: false }).sort({ dayOfWeek: 1, startMinutes: 1 }).lean();

  res.json({ venue, schedules });
};

export const findFreeRooms = async (req, res) => {
  const dayOfWeek = String(req.query.day || "").toLowerCase();
  const start = parseTimeToMinutes(String(req.query.time || ""));
  const duration = Number(req.query.duration || 60);

  if (!days.includes(dayOfWeek) || start === null || !Number.isFinite(duration) || duration <= 0) {
    return res.status(400).json({ message: "Provide day, time, and a positive duration in minutes" });
  }

  const end = start + duration;
  const venues = await getAllVenues();
  const schedules = await ClassSchedule.find({ dayOfWeek, isCancelled: false }).lean();
  const busyRooms = new Set(
    schedules.filter((slot) => overlaps(slot.startMinutes, slot.endMinutes, start, end)).map((slot) => slot.roomNo)
  );
  const now = new Date();
  const clubEvents = await Notification.find({
    eventType: "club",
    venueName: { $ne: "" },
    isActive: true,
    eventAt: { $ne: null },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  }).lean();

  clubEvents.forEach((event) => {
    const eventStart = new Date(event.eventAt);
    const duration = Number(event.eventDurationMinutes || 60);
    const eventEnd = new Date(eventStart.getTime() + duration * 60 * 1000);

    if (eventEnd <= now) return;
    if (jsDayToName[eventStart.getDay()] !== dayOfWeek) return;
    if (overlaps(dateToMinutes(eventStart), dateToMinutes(eventEnd), start, end)) {
      busyRooms.add(event.venueName);
    }
  });

  const rooms = venues
    .filter((venue) => !busyRooms.has(venue.name))
    .map((venue) => ({
      ...venue,
      freeFrom: formatMinutes(start),
      freeUntil: formatMinutes(end)
    }));

  res.json({ dayOfWeek, startTime: formatMinutes(start), endTime: formatMinutes(end), rooms });
};
