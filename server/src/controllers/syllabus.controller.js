import SyllabusDocument from "../models/SyllabusDocument.js";

export const getSyllabusDocuments = async (req, res) => {
  try {
    const documents = await SyllabusDocument.find({})
      .sort({ branch: 1, syllabusType: 1, sourceId: 1 })
      .lean();

    return res.json({
      items: documents.map((document) => ({
        id: document.sourceId,
        programType: document.programType,
        branch: document.branch,
        branchName: document.branchName,
        syllabusType: document.syllabusType,
        title: document.title,
        semester: document.semester,
        file: document.file,
        url: document.url,
        publishedAt: document.publishedAt,
        bullets: document.bullets || []
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load syllabus data" });
  }
};
