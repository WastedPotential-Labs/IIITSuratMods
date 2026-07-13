// Parses the raw text lines extracted from curriculum PDFs into structured
// course tables. The PDF text arrives as loose lines like:
//   "Semester-1"
//   "1 Fundamentals of Computers &"
//   "Programming CS 101 4 3 0 2 100 0 50 150"
//   "Total 21 16 1 08 500 25 200 725"
// Some PDFs also cram several rows into ONE line:
//   "2 Engineering Physics AS 101 4 3 0 2 100 0 50 150 3 Engineering Mathematics MS 101 ..."
// A course row is: [srNo] name CODE NUM credit L T P marks..., where the name
// (and sometimes the whole row tail) can wrap onto neighbouring lines.

// Headers appear as "Semester-1" (CSE/ECE) or "1st Semester" (MNC).
const SEMESTER_RE = /^(?:Semester\s*-?\s*(\d+)|(\d+)(?:st|nd|rd|th)\s+Semester)/i;

// Table-header and layout noise emitted by the PDF extractor.
const NOISE_RES = [
  /^Sr\.?\s?No/i,
  /^Course$/i,
  /^Code$/i,
  /^Credit$/i,
  /^Teaching/i,
  /^Scheme/i,
  /^\(Hr\.?\)/i,
  /Examination Scheme/i,
  /^Total$/i,
  /^Semester$/i
];

// Full course row: optional serial number, name, course code, then at least
// credit + L + T + P followed by the marks columns.
const FULL_ROW_RE = /^(?:(\d{1,2})\s+)?(.+?)\s+([A-Z]{2,4})\s?-?\s?(\d{2,4}[A-Z]?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})((?:\s+\d+)+)$/;

// Continuation row: the code + numbers when the course name wrapped onto the
// previous line(s).
const CODE_ROW_RE = /^([A-Z]{2,4})\s?-?\s?(\d{2,4}[A-Z]?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})((?:\s+\d+)+)$/;

// Elective placeholders have no course code and dashed columns:
// "6 Elective - 2 - 3 - 0 - - 0 - 100"
const ELECTIVE_ROW_RE = /^(?:(\d{1,2})\s+)?(Elective\s*-?\s*\d+)\b([\s\-0-9]*)$/i;

const TOTAL_ROW_RE = /^Total((?:\s+\d+)+)$/i;

const lastNumber = (numsText) => {
  const nums = numsText.trim().split(/\s+/);
  return nums[nums.length - 1];
};

// Un-jam lines that hold several table rows at once, so the line-based
// matcher only ever sees one row per line.
const preprocess = (bullets) => {
  let text = bullets.join("\n");

  // Layout noise that can appear mid-line. [ \t] only — \s would let \d* eat
  // the leading digit of "2nd Semester" on the next line.
  text = text.replace(/Total Contact Hours per Week[ \t]*\d*/gi, "\n");
  text = text.replace(/(?:^|\s)(?:L\s+T\s+P\s*){2,}/g, "\n");

  // New line before every semester header and totals row. The lookaheads use
  // [ \t] (not \s) so "…2nd Semester\n1 Data…" is not misread as the header
  // "Semester 1" across a line break.
  text = text.replace(/\s+(?=Semester[ \t]*-?[ \t]*\d)/gi, "\n");
  text = text.replace(/\s+(?=\d+(?:st|nd|rd|th)[ \t]+Semester)/gi, "\n");
  text = text.replace(/\s+(?=Total(?:\s+\d)+)/g, "\n");

  // Split "...50 150 3 Engineering Mathematics..." between the end of one
  // row's marks and the next row's serial number + capitalized name.
  // [ \t] only: matching across the newline would swallow a row's final mark
  // when the next line happens to start with a capitalized word ("Total ...").
  text = text.replace(/(\d)[ \t]+(?=\d{1,2}[ \t]+[A-Z][A-Za-z&])/g, "$1\n");

  return text.split("\n");
};

export function parseCurriculum(bullets) {
  const sections = [];
  let current = null;
  let pendingName = "";
  let pendingSr = "";

  const clearPending = () => {
    pendingName = "";
    pendingSr = "";
  };

  const ensureSection = (title) => {
    current = { title, rows: [], total: null };
    sections.push(current);
    clearPending();
  };

  const pushRow = (sr, name, code, credit, l, t, p, total) => {
    if (!current) ensureSection("Courses");
    current.rows.push({
      sr: sr || String(current.rows.length + 1),
      name: name.replace(/\s+/g, " ").trim(),
      code,
      credit,
      l,
      t,
      p,
      total
    });
    clearPending();
  };

  for (const rawLine of preprocess(bullets)) {
    const line = rawLine.trim();
    if (!line) continue;

    const semester = line.match(SEMESTER_RE);
    if (semester) {
      ensureSection(`Semester ${semester[1] || semester[2]}`);
      continue;
    }

    const total = line.match(TOTAL_ROW_RE);
    if (total) {
      if (current) {
        const nums = total[1].trim().split(/\s+/);
        current.total = { credit: nums[0], marks: nums[nums.length - 1] };
      }
      clearPending();
      continue;
    }

    if (NOISE_RES.some((re) => re.test(line))) continue;

    // Numbers-only fragments (orphaned totals etc.) must not leak into names.
    if (/^[\d\s\-]+$/.test(line)) {
      clearPending();
      continue;
    }

    const full = line.match(FULL_ROW_RE);
    if (full) {
      const [, sr, name, dept, num, credit, l, t, p, marks] = full;
      // A row that carries its own serial number is complete; only a row
      // without one continues a wrapped name from previous lines.
      const fullName = sr ? name : `${pendingName} ${name}`;
      pushRow(sr || pendingSr, fullName, `${dept} ${num}`, credit, l, t, p, lastNumber(marks));
      continue;
    }

    const codeRow = line.match(CODE_ROW_RE);
    if (codeRow && pendingName) {
      const [, dept, num, credit, l, t, p, marks] = codeRow;
      pushRow(pendingSr, pendingName, `${dept} ${num}`, credit, l, t, p, lastNumber(marks));
      continue;
    }

    const elective = line.match(ELECTIVE_ROW_RE);
    if (elective) {
      const [, sr, name, tail] = elective;
      const nums = tail.match(/\d+/g) || [];
      pushRow(sr, name, "—", nums[0] || "", "", "", "", nums[nums.length - 1] || "");
      continue;
    }

    // Anything else is (part of) a wrapped course name. Peel off a leading
    // serial number the first time we see one for this pending row.
    const srMatch = !pendingName && line.match(/^(\d{1,2})\s+(.*)$/);
    if (srMatch) {
      pendingSr = srMatch[1];
      pendingName = srMatch[2];
    } else {
      pendingName = `${pendingName} ${line}`.trim();
    }
  }

  const rowCount = sections.reduce((count, section) => count + section.rows.length, 0);
  return { sections: sections.filter((section) => section.rows.length), rowCount };
}
