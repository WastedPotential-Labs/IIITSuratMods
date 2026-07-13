import './styling/timetable.css'
import { weeklyTimetableMock } from '../MockData/WeeklyTimeTable';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const subjectColors = ["lime", "yellow", "teal", "coral", "purple", "orange"];

const formatSlot = (slot) =>
  slot
    .replace(/\s?AM|\s?PM/g, "")
    .replace(" - ", "\n-\n")
    .replace(/^0/, "");

const getSubjectMap = (rows) => {
  const map = new Map();

  rows.forEach((row) => {
    if (row.isBreak) return;
    row.schedule.forEach((course) => {
      if (!course || map.has(course.courseCode)) return;
      map.set(course.courseCode, {
        ...course,
        color: subjectColors[map.size % subjectColors.length]
      });
    });
  });

  return map;
};

export default function TimeTable(props) {
  const data = weeklyTimetableMock;
  const subjectMap = getSubjectMap(data);

  return (
    <section className="schedule-page" style={{ "--day-count": days.length }}>
      <header className="schedule-hero">
        <div>
          <h1>Weekly Timetable</h1>
          <p>Academic Year {props.year} · Semester {props.semester} · {props.section}</p>
        </div>
        <div className="schedule-badge">
          <span>Class Schedule</span>
          <strong>2026</strong>
          <div className="badge-icon">1</div>
        </div>
      </header>

      <div className="schedule-layout">
        <div className="schedule-grid-wrap">
          <div className="schedule-grid--days">
            <div />
            {days.map((day) => (
              <div className="day-heading" key={day}>{day}</div>
            ))}
          </div>

          <div className="schedule-rows">
            {data.map((row) => {
              if (row.isBreak) {
                return (
                  <div className="banner-row" key={row.timeSlot}>
                    {row.label}
                  </div>
                );
              }

              return (
                <div className="schedule-row-grid" key={row.timeSlot}>
                  <div className="time-cell">{formatSlot(row.timeSlot)}</div>
                  {row.schedule.map((course, index) => {
                    if (!course) {
                      return <div className="empty-cell" key={`${row.timeSlot}-${days[index]}`} />;
                    }

                    const color = subjectMap.get(course.courseCode)?.color || "lime";
                    return (
                      <article className={`course-block block--${color}`} key={`${row.timeSlot}-${days[index]}-${course.courseCode}`}>
                        <h3>{course.courseCode}</h3>
                        <p className="course-title">{course.courseName}</p>
                        <p className="course-faculty">{course.facultyName}</p>
                        <strong>{course.roomNo}</strong>
                      </article>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="schedule-sidebar">
          <section className="sidebar-panel">
            <h2>Subjects</h2>
            <div className="legend-list">
              {[...subjectMap.entries()].map(([code, course]) => (
                <div className="legend-item" key={code}>
                  <span className={`legend-swatch block--${course.color}`} />
                  <p><strong>{code}</strong> · {course.courseName}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="note-panel">
            <h2>Note:</h2>
            <p>Lab sessions run in CSE LAB 2/3 and ECE LAB 3. Lecture rooms are CR 5 and CR 6.</p>
          </section>
        </aside>
      </div>
    </section>
  )
}
