// Seeds venues and class schedules into MongoDB from data/timetableSeed.json.
// Safe to re-run: venues are upserted by name and schedules are replaced.
//
// Usage, from the server/ folder:  npm run seed:timetables
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Venue from "../src/models/Venue.js";
import ClassSchedule from "../src/models/ClassSchedule.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(here, "..", "data", "timetableSeed.json");

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

try {
  const seed = JSON.parse(await readFile(seedPath, "utf8"));
  const venues = seed.venues || [];
  const schedules = seed.schedules || [];

  await mongoose.connect(process.env.MONGO_URI);

  for (const venue of venues) {
    await Venue.findOneAndUpdate({ name: venue.name }, venue, { upsert: true, runValidators: true });
  }
  console.log(`Upserted ${venues.length} venues.`);

  await ClassSchedule.deleteMany({});
  if (schedules.length) {
    await ClassSchedule.insertMany(schedules);
  }
  console.log(`Inserted ${schedules.length} schedule entries.`);
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
