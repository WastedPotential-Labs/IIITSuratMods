import mongoose from "mongoose";

const syllabusDocumentSchema = new mongoose.Schema(
  {
    sourceId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    programType: String,
    branch: {
      type: String,
      required: true,
      index: true
    },
    branchName: String,
    syllabusType: {
      type: String,
      required: true,
      index: true
    },
    title: String,
    semester: {
      type: String,
      required: true,
      index: true
    },
    file: String,
    url: String,
    publishedAt: Date,
    bullets: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

syllabusDocumentSchema.index({ branch: 1, syllabusType: 1, semester: 1 });

const SyllabusDocument = mongoose.model("SyllabusDocument", syllabusDocumentSchema);

export default SyllabusDocument;
