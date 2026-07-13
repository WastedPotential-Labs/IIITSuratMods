import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/Auth";
import { parseCurriculum } from "../src/curriculumParser";
import "./styling/academics.css";

const branchByBatch = {
  "CSE 1": "UGCSE",
  "CSE 2": "UGCSE",
  ECE: "UGECE",
  MNC: "UGMCS"
};

const typeLabels = {
  NEW: "2025 curriculum",
  NEP: "NEP curriculum",
  old: "Older curriculum"
};

const referenceMaterials = [
  {
    title: "NPTEL",
    description: "Lecture series, assignments, and certification material for engineering subjects.",
    url: "https://nptel.ac.in/"
  },
  {
    title: "SWAYAM",
    description: "MOOC courses and reference content from Indian higher-education institutions.",
    url: "https://swayam.gov.in/"
  },
  {
    title: "MIT OpenCourseWare",
    description: "Open lecture notes, readings, and assignments for CS, math, and engineering courses.",
    url: "https://ocw.mit.edu/"
  },
  {
    title: "GeeksforGeeks",
    description: "Topic-wise programming, DSA, DBMS, OS, CN, and interview reference material.",
    url: "https://www.geeksforgeeks.org/"
  }
];

const getAdmissionYear = (email) => {
  const match = String(email || "").match(/^ug(\d{2})/i);
  return match ? 2000 + Number(match[1]) : null;
};

const getSyllabusType = (email) => {
  const admissionYear = getAdmissionYear(email);
  if (!admissionYear) return "NEP";
  if (admissionYear >= 2025) return "NEW";
  if (admissionYear >= 2023) return "NEP";
  return "old";
};

const lineLooksLikeCourse = (line) =>
  /\b[A-Z]{2,3}\s?\d{3,4}\b/.test(line) ||
  /\b(L|T|P|C|Credits?)\b/i.test(line) ||
  /\b(Mathematics|Programming|Circuit|Data|Signals|Algorithm|Communication|Electronics|Physics|Project|Laboratory|Design)\b/i.test(line);

function CourseTable({ section }) {
  return (
    <div className="semester-block">
      <h4 className="semester-title">{section.title}</h4>
      <div className="table-scroll">
        <table className="course-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Course</th>
              <th>Code</th>
              <th>Credits</th>
              <th>L</th>
              <th>T</th>
              <th>P</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, index) => (
              <tr key={`${section.title}-${row.code}-${index}`}>
                <td>{row.sr}</td>
                <td className="course-name">{row.name}</td>
                <td className="course-code">{row.code}</td>
                <td>{row.credit}</td>
                <td>{row.l}</td>
                <td>{row.t}</td>
                <td>{row.p}</td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
          {section.total && (
            <tfoot>
              <tr>
                <td></td>
                <td>Total</td>
                <td></td>
                <td>{section.total.credit}</td>
                <td colSpan="3"></td>
                <td>{section.total.marks}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function BulletBlock({ title, item, textEntry }) {
  const bullets = textEntry?.bullets || [];
  const parsed = useMemo(() => parseCurriculum(bullets), [bullets]);
  const preferred = bullets.filter(lineLooksLikeCourse);
  const visibleBullets = (preferred.length >= 8 ? preferred : bullets).slice(0, 140);

  // Render a structured table when enough of the text parses as course rows;
  // otherwise fall back to the raw extracted lines.
  const showTables = parsed.rowCount >= 5;

  return (
    <article className="curriculum-panel">
      <div className="curriculum-panel__header">
        <div>
          <span>{item?.branchName || "Syllabus"}</span>
          <h3>{title}</h3>
          {item && <p>{typeLabels[item.syllabusType] || item.syllabusType}</p>}
        </div>
        {item?.url && (
          <a href={item.url} target="_blank" rel="noreferrer">
            Source PDF
          </a>
        )}
      </div>

      {showTables ? (
        parsed.sections.map((section) => <CourseTable section={section} key={section.title} />)
      ) : visibleBullets.length ? (
        <ul className="curriculum-list">
          {visibleBullets.map((line, index) => (
            <li key={`${item?.id || title}-${index}`}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="academics-empty">No text could be extracted for this file.</p>
      )}
    </article>
  );
}

export default function Academics() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [textItems, setTextItems] = useState({});
  const [status, setStatus] = useState("Loading syllabus...");

  useEffect(() => {
    Promise.all([
      fetch("/syllabusData.json").then((response) => {
        if (!response.ok) throw new Error("Unable to load syllabus metadata");
        return response.json();
      }),
      fetch("/syllabusText.json").then((response) => {
        if (!response.ok) throw new Error("Unable to load extracted syllabus text");
        return response.json();
      })
    ])
      .then(([metadata, extractedText]) => {
        setItems(metadata.items || []);
        setTextItems(extractedText.items || {});
        setStatus("");
      })
      .catch((error) => setStatus(error.message));
  }, []);

  const profileSelection = useMemo(() => {
    if (!user) return null;

    const branch = branchByBatch[user.batch];
    const syllabusType = getSyllabusType(user.email);
    const semester = user.semester;

    const curriculum =
      items.find((item) => item.branch === branch && item.syllabusType === syllabusType && item.semester === "Curriculum") ||
      items.find((item) => item.branch === branch && item.semester === "Curriculum");

    const semesterSyllabus =
      items.find((item) => item.branch === branch && item.syllabusType === syllabusType && item.semester === semester) ||
      items.find((item) => item.branch === branch && item.semester === semester);

    return { branch, syllabusType, semester, curriculum, semesterSyllabus };
  }, [items, user]);

  if (!user) {
    return (
      <div className="academics-page">
        <h1>Academics</h1>
        <p className="academics-status">Please log in and complete your profile to view your semester syllabus.</p>
      </div>
    );
  }

  return (
    <div className="academics-page">
      <div className="academics-header">
        <div>
          <h1>Academics</h1>
          <p>
            Showing syllabus for {user.batch}, {user.semester}, based on your profile.
          </p>
        </div>
      </div>

      {status && <p className="academics-status">{status}</p>}

      <section className="profile-syllabus-card">
        <strong>{user.username}</strong>
        <span>{user.email}</span>
        <span>
          {user.batch} | {user.semester} | {typeLabels[profileSelection?.syllabusType] || profileSelection?.syllabusType}
        </span>
      </section>

      <section className="academics-section">
        <h2>Curriculum</h2>
        {profileSelection?.curriculum ? (
          <BulletBlock
            title={`${profileSelection.curriculum.branchName} Curriculum`}
            item={profileSelection.curriculum}
            textEntry={textItems[String(profileSelection.curriculum.id)]}
          />
        ) : (
          <p className="academics-empty">No curriculum found for your profile branch.</p>
        )}
      </section>

      <section className="academics-section">
        <h2>{user.semester} Syllabus</h2>
        {profileSelection?.semesterSyllabus ? (
          <BulletBlock
            title={profileSelection.semesterSyllabus.semester}
            item={profileSelection.semesterSyllabus}
            textEntry={textItems[String(profileSelection.semesterSyllabus.id)]}
          />
        ) : (
          <p className="academics-empty">
            No semester-specific syllabus is available for {user.batch} {user.semester}. The curriculum above is still available.
          </p>
        )}
      </section>

      <section className="academics-section">
        <h2>Reference Material</h2>
        <div className="reference-grid">
          {referenceMaterials.map((material) => (
            <article className="reference-card" key={material.title}>
              <h3>{material.title}</h3>
              <p>{material.description}</p>
              <a href={material.url} target="_blank" rel="noreferrer">
                Open
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
