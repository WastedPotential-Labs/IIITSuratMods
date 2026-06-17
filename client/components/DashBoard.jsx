import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import './styling/dashboard.css'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { weeklyTimetableMock } from '../MockData/WeeklyTimeTable';
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

    if (current.isAfter(start) && current.isBefore(end)) status = 'live';
    else status='notLive';

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

// Main Dashboard component
function Dashboard() {
  const todaysClasses = getTodaysClasses(weeklyTimetableMock);
  const classesWithStatus = useClassStatuses(todaysClasses);

  return (
    <div className="dashboard">
      <h1>Today's Schedule</h1>
      <br/>
      <h3 className=''>{dayjs().format('dddd, DD MMM YYYY')} - {todaysClasses.length} Classes Scheduled </h3><br/><br/>

      {todaysClasses.length === 0 ? 
        (<p>No classes today 🎉</p>)
        :(<div className="today-schedule-row">
          {classesWithStatus.map((cls) => (
            <TodayClassCard data={cls} />
          ))}
        </div>)}
    </div>
  );
}

export default Dashboard;