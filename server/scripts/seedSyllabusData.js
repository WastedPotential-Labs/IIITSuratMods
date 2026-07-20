// Seeds full syllabus metadata and extracted PDF text into MongoDB.
// Safe to re-run: documents are upserted by their source id.
//
// Usage, from the server/ folder: npm run seed:syllabus
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import SyllabusDocument from "../src/models/SyllabusDocument.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const metadataPath = path.join(here, "..", "data", "syllabusData.json");
const textPath = path.join(here, "..", "data", "syllabusText.json");

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

try {
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const extractedText = JSON.parse(await readFile(textPath, "utf8"));
  const textById = extractedText.items || {};
  const documents = (metadata.items || []).map((item) => ({
    sourceId: item.id,
    programType: item.programType,
    branch: item.branch,
    branchName: item.branchName,
    syllabusType: item.syllabusType,
    title: item.title,
    semester: item.semester,
    file: item.file,
    url: item.url,
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    bullets: textById[String(item.id)]?.bullets || []
  }));

  await mongoose.connect(process.env.MONGO_URI);

  for (const document of documents) {
    await SyllabusDocument.findOneAndUpdate(
      { sourceId: document.sourceId },
      document,
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Upserted ${documents.length} syllabus documents.`);
} catch (error) {
  console.error("Syllabus seeding failed:", error.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
