import { useEffect, useMemo, useState } from "react";
import api from "../src/api";
import "./styling/venues.css";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const toMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const formatMinutes = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

const loadLocalSeed = async () => {
  const response = await fetch("/timetableSeed.json");
  if (!response.ok) throw new Error("Local timetable seed not found");
  return response.json();
};

const localVenueSearch = (seed, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  const venues = seed.venues || [];
  if (!normalizedQuery) return venues;

  return venues.filter((venue) =>
    [venue.name, venue.type, venue.building, venue.notes].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery)
  );
};

const localVenueSchedules = (seed, venueName) =>
  (seed.schedules || [])
    .filter((slot) => slot.roomNo === venueName && !slot.isCancelled)
    .map((slot, index) => ({ ...slot, _id: `${slot.source}-${slot.dayOfWeek}-${slot.startTime}-${index}` }))
    .sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek) || a.startMinutes - b.startMinutes);

const localFreeRooms = (seed, params) => {
  const start = toMinutes(params.time);
  const duration = Number(params.duration);
  const end = start + duration;
  const busyRooms = new Set(
    (seed.schedules || [])
      .filter(
        (slot) =>
          slot.dayOfWeek === params.day &&
          !slot.isCancelled &&
          overlaps(slot.startMinutes, slot.endMinutes, start, end)
      )
      .map((slot) => slot.roomNo)
  );

  return (seed.venues || [])
    .filter((venue) => !busyRooms.has(venue.name))
    .map((venue) => ({ ...venue, freeFrom: formatMinutes(start), freeUntil: formatMinutes(end) }));
};

function ScheduleList({ schedules }) {
  if (!schedules.length) return <p className="muted">No scheduled classes found for this venue.</p>;

  return (
    <div className="venue-schedule">
      {schedules.map((slot) => (
        <article className="schedule-row" key={slot._id}>
          <span>{slot.dayOfWeek}</span>
          <span>
            {slot.startTime} - {slot.endTime}
          </span>
          <span>{slot.batch}</span>
          <strong>{slot.courseCode}</strong>
          <span>{slot.courseName || slot.rawText}</span>
        </article>
      ))}
    </div>
  );
}

const getVenueCardClass = (venue) => {
  const name = venue.name.toLowerCase();
  if (name.includes("cse")) return "venue-card--cse";
  if (name.includes("ece")) return "venue-card--ece";
  if (name.includes("phy")) return "venue-card--phy";
  return "venue-card--classroom";
};

function VenueCard({ venue, onClick }) {
  return (
    <button className={`venue-card ${getVenueCardClass(venue)}`} type="button" onClick={() => onClick(venue)}>
      <span className="venue-name">{venue.name}</span>
      <span className="venue-type">{venue.type}</span>
      {venue.freeFrom && (
        <small>
          {venue.freeFrom} - {venue.freeUntil}
        </small>
      )}
      {venue.building && <small>{venue.building}</small>}
    </button>
  );
}

export default function Venues() {
  const [query, setQuery] = useState("");
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [freeParams, setFreeParams] = useState({ day: "monday", time: "09:00", duration: 60 });
  const [freeRooms, setFreeRooms] = useState([]);
  const [hasSearchedRooms, setHasSearchedRooms] = useState(false);
  const [message, setMessage] = useState("");
  const [localSeed, setLocalSeed] = useState(null);

  const filteredFreeRooms = useMemo(
    () => freeRooms.filter((room) => room.name.toLowerCase().includes(query.toLowerCase())),
    [freeRooms, query]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      api
        .get("/venues", { params: { q: query } })
        .then((response) => {
          setVenues(response.data.venues || []);
          setMessage("");
        })
        .catch(async () => {
          try {
            const seed = localSeed || (await loadLocalSeed());
            setLocalSeed(seed);
            setVenues(localVenueSearch(seed, query));
            setMessage("Using local timetable data because the backend API is not running.");
          } catch (error) {
            setMessage("Unable to load venues from the API or local timetable seed.");
          }
        });
    }, 200);

    return () => clearTimeout(handle);
  }, [query, localSeed]);

  const openVenue = async (venue) => {
    setSelected(venue);
    setMessage("");
    try {
      const response = await api.get(`/venues/${encodeURIComponent(venue.name)}`);
      setSelected(response.data.venue);
      setSelectedSchedules(response.data.schedules || []);
    } catch (error) {
      try {
        const seed = localSeed || (await loadLocalSeed());
        setLocalSeed(seed);
        setSelected(venue);
        setSelectedSchedules(localVenueSchedules(seed, venue.name));
        setMessage("Using local timetable data because the backend API is not running.");
      } catch {
        setMessage("Unable to load venue schedule from the API or local timetable seed.");
      }
    }
  };

  const findRooms = async (event) => {
    event.preventDefault();
    setMessage("");
    setHasSearchedRooms(true);
    try {
      const response = await api.get("/venues/free", { params: freeParams });
      setFreeRooms(response.data.rooms || []);
    } catch (error) {
      try {
        const seed = localSeed || (await loadLocalSeed());
        setLocalSeed(seed);
        setFreeRooms(localFreeRooms(seed, freeParams));
        setMessage("Using local timetable data because the backend API is not running.");
      } catch {
        setMessage(error.response?.data?.message || "Unable to find free rooms from the API or local timetable seed.");
      }
    }
  };

  return (
    <div className="venue-page">
      <div className="venue-header">
        <div>
          <h1>Venues</h1>
          <p>Search classrooms, inspect room schedules, and find free spaces from imported timetables.</p>
        </div>
        <div className="venue-header-tools">
          <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search CR 2, CSE Lab..." />
        </div>
      </div>

      {message && <p className="status-message">{message}</p>}

      <form className="finder-panel" onSubmit={findRooms}>
        <label className="field--day">
          DAY
          <select value={freeParams.day} onChange={(event) => setFreeParams({ ...freeParams, day: event.target.value })}>
            {days.map((day) => (
              <option value={day} key={day}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="field--start">
          START
          <input
            type="time"
            value={freeParams.time}
            onChange={(event) => setFreeParams({ ...freeParams, time: event.target.value })}
          />
        </label>
        <label className="field--duration">
          DURATION (MIN)
          <input
            type="number"
            min="15"
            step="15"
            value={freeParams.duration}
            onChange={(event) => setFreeParams({ ...freeParams, duration: event.target.value })}
          />
        </label>
        <button className="find-btn" type="submit">FIND FREE ROOMS</button>
      </form>

      {hasSearchedRooms && (
        <section className="venue-section">
          <h2>Free Rooms</h2>
          {filteredFreeRooms.length > 0 ? (
            <div className="venue-grid">
              {filteredFreeRooms.map((room) => (
                <VenueCard venue={room} key={room.name} onClick={openVenue} />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No rooms available{query.trim() ? ` matching "${query.trim()}"` : ""} for {freeParams.day} from {freeParams.time} for{" "}
              {freeParams.duration} minutes.
            </p>
          )}
        </section>
      )}

      <section className="venue-layout">
        <div className="venue-section">
          <h2>All Venues</h2>
          {venues.length > 0 ? (
            <div className="venue-grid">
              {venues.map((venue) => (
                <VenueCard venue={venue} key={venue.name} onClick={openVenue} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No venues match your search.</p>
          )}
          <div className="venue-legend">
            <div className="venue-legend-item"><span className="legend-swatch venue-card--classroom" />Classroom</div>
            <div className="venue-legend-item"><span className="legend-swatch venue-card--cse" />CSE Lab</div>
            <div className="venue-legend-item"><span className="legend-swatch venue-card--ece" />ECE Lab</div>
            <div className="venue-legend-item"><span className="legend-swatch venue-card--phy" />PHY Lab</div>
          </div>
        </div>

        <aside className="venue-detail">
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p>{selected.notes || "Imported from timetable data."}</p>
              <ScheduleList schedules={selectedSchedules} />
            </>
          ) : (
            <div className="detail-empty">
              <div className="detail-icon">🏛</div>
              <p className="detail-title">Select a venue to view its weekly usage.</p>
              <p className="detail-hint">Tap any room card on the left.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
