import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './styling/dashboard.css'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { weeklyTimetableMock } from '../MockData/WeeklyTimeTable';
import api from '../src/api';
import { useAuth } from '../context/Auth';
import profileIcon from './icons/profile.png'
import pinIcon from './icons/pin.png'
dayjs.extend(customParseFormat);


// for today's classes, startTime and endTime
function getTodaysClasses(timetable) {
  const jsDay = dayjs().day(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (jsDay === 0) return []; // no classes on sunday

  const dayIndex = jsDay - 1; // Monday=0

  return timetable
    .filter(slot => !slot.isBreak)
    .map(slot => {
      const cls = slot.schedule[dayIndex];
      if (!cls) return null;
      const [startTime, endTime] = slot.timeSlot.split(' - ');
      return { ...cls, startTime, endTime };
    })
    .filter(Boolean);
}

const formatSeedTime = (time) => {
  const [hourValue, minuteValue] = String(time).split(":").map(Number);
  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) return time;

  const meridiem = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")} ${meridiem}`;
};

function getTodaysClassesFromSchedules(schedules) {
  const day = dayjs().format("dddd").toLowerCase();

  return schedules
    .filter((slot) => slot.dayOfWeek === day && !slot.isCancelled)
    .sort((a, b) => a.startMinutes - b.startMinutes)
    .map((slot) => ({
      courseCode: slot.courseCode,
      courseName: slot.courseName || slot.rawText,
      facultyName: slot.facultyName,
      roomNo: slot.roomNo,
      startTime: formatSeedTime(slot.startTime),
      endTime: formatSeedTime(slot.endTime)
    }));
}

// for which class is live
function useClassStatuses(timetable) {
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  return timetable.map(cls => {
    const start = dayjs(cls.startTime, 'hh:mm A');
    const end = dayjs(cls.endTime, 'hh:mm A');
    const current = dayjs(now.format('hh:mm A'), 'hh:mm A');
    let status = 'notLive';

    if (current.isAfter(start) && current.isBefore(end)) status = 'live';

    return { ...cls, status };
  });
}

function TodayClassCard({ data }) {
  const isLive = data.status === 'live';

  return (
    <div className={`class-card ${isLive ? 'class-card--live' : ''}`}>
      <div className="class-card__header">
        <span className="class-card__time">{data.startTime} - {data.endTime}</span>
        {isLive && <span className="badge badge--live">HAPPENING NOW</span>}
      </div>
      <h3>{data.courseCode}</h3>
        <hr/>
      <p className="class-card__title">{data.courseName}</p>
      <div className="class-card__meta">
        <span> <img src={profileIcon} className='class-card__icon'/>{data.facultyName}</span>
        <span><img src={pinIcon} className='class-card__icon'/>{data.roomNo}</span>
      </div>
    </div>
  );
}

function DashboardNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api
      .get("/notifications")
      .then((response) => setNotifications(response.data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <section className="dashboard-notices">
      <div className="dashboard-section-heading">
        <h2>Notifications</h2>
        <span>{notifications.length} active</span>
      </div>

      {notifications.length === 0 ? (
        <p className="empty-day">No notifications right now.</p>
      ) : (
        <div className="dashboard-notice-list">
          {notifications.slice(0, 4).map((notification) => (
            <article className="dashboard-notice-card" key={notification._id}>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              {notification.eventType === "club" && notification.venueName && <span>Venue: {notification.venueName}</span>}
              {notification.eventAt && <time>{new Date(notification.eventAt).toLocaleString()}</time>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// Main Dashboard component
function Dashboard() {
  const { user } = useAuth();
  const [todaysImportedClasses, setTodaysImportedClasses] = useState([]);

  useEffect(() => {
    if (!user) {
      setTodaysImportedClasses([]);
      return;
    }

    api
      .get("/timetable/imported/today")
      .then((response) => setTodaysImportedClasses(response.data.classes || []))
      .catch(() => setTodaysImportedClasses([]));
  }, [user]);

  const todaysClasses = user ? getTodaysClassesFromSchedules(todaysImportedClasses) : getTodaysClasses(weeklyTimetableMock);
  const classesWithStatus = useClassStatuses(todaysClasses);

  return (
    <div className="dashboard">
      <h1>Today's Schedule</h1>
      <br/>
      <h3 className=''>{dayjs().format('dddd, DD MMM YYYY')} - {todaysClasses.length} Classes Scheduled </h3><br/><br/>

      {todaysClasses.length === 0 ?
        (<p className="empty-day">No classes today</p>)
        :(<div className="today-schedule-row">
          {classesWithStatus.map((cls) => (
            <TodayClassCard data={cls} key={`today-${cls.startTime}-${cls.courseCode}`} />
          ))}
        </div>)}

      <DashboardNotifications />
    </div>
  );
}

export default Dashboard;
