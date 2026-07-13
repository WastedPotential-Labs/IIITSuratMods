import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/Auth";
import api from "../src/api";
import "./styling/venues.css";
import "./styling/admin.css";

const emptyNotice = {
  title: "",
  message: "",
  audience: "all",
  eventAt: "",
  expiresAt: "",
  isActive: true
};

const audienceLabels = {
  all: "All users",
  cse: "CSE",
  ece: "ECE",
  mtech: "M.Tech",
  admins: "Admins"
};

export default function Admin() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notice, setNotice] = useState(emptyNotice);
  const [filter, setFilter] = useState({ day: "", roomNo: "", batch: "" });
  const [editingId, setEditingId] = useState(null);
  const [scheduleDraft, setScheduleDraft] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadAdminData = useCallback(async () => {
    const [summaryResponse, scheduleResponse, notificationResponse] = await Promise.all([
      api.get("/admin/summary"),
      api.get("/admin/schedules", { params: filter }),
      api.get("/notifications/admin")
    ]);
    setSummary(summaryResponse.data);
    setSchedules(scheduleResponse.data.schedules || []);
    setNotifications(notificationResponse.data.notifications || []);
  }, [filter]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAdminData().catch(() => setError("Unable to load admin data"));
  }, [isAdmin, loadAdminData]);

  const flash = (text) => {
    setMessage(text);
    setError("");
    setTimeout(() => setMessage(""), 4000);
  };

  const createNotification = async (event) => {
    event.preventDefault();
    setPublishing(true);
    setMessage("");
    setError("");
    try {
      await api.post("/notifications", {
        ...notice,
        eventAt: notice.eventAt || null,
        expiresAt: notice.expiresAt || null
      });
      setNotice(emptyNotice);
      await loadAdminData();
      flash("Notification published — it is now visible to users.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create notification");
    } finally {
      setPublishing(false);
    }
  };

  const toggleNotification = async (notification) => {
    try {
      await api.put(`/notifications/${notification._id}`, { isActive: !notification.isActive });
      await loadAdminData();
    } catch {
      setError("Unable to update notification");
    }
  };

  const deleteNotification = async (notification) => {
    if (!window.confirm(`Delete notification "${notification.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/notifications/${notification._id}`);
      await loadAdminData();
      flash("Notification deleted.");
    } catch {
      setError("Unable to delete notification");
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    loadAdminData().catch(() => setError("Unable to apply filters"));
  };

  const deleteSchedule = async (slot) => {
    if (!window.confirm(`Delete the ${slot.roomNo} ${slot.dayOfWeek} ${slot.startTime} slot?`)) return;
    try {
      await api.delete(`/admin/schedules/${slot._id}`);
      await loadAdminData();
      flash("Schedule entry deleted.");
    } catch {
      setError("Unable to delete schedule");
    }
  };

  const startEditing = (slot) => {
    setEditingId(slot._id);
    setScheduleDraft({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      batch: slot.batch,
      roomNo: slot.roomNo,
      courseCode: slot.courseCode,
      courseName: slot.courseName,
      facultyName: slot.facultyName,
      rawText: slot.rawText
    });
  };

  const saveSchedule = async (id) => {
    try {
      await api.put(`/admin/schedules/${id}`, scheduleDraft);
      setEditingId(null);
      setScheduleDraft({});
      await loadAdminData();
      flash("Schedule updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save schedule");
    }
  };

  if (!user) {
    return (
      <div className="venue-page">
        <h1>Admin</h1>
        <p className="status-message">Please log in with an admin account to open the admin dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="venue-page">
        <h1>Admin</h1>
        <p className="status-message">
          Admin access required. Ask a maintainer to promote your account, or run{" "}
          <code>npm run make:admin -- {user.email}</code> inside the server folder.
        </p>
      </div>
    );
  }

  return (
    <div className="venue-page admin-page">
      <div className="venue-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Publish notifications to every user, review imported rooms, and modify timetable data.</p>
        </div>
      </div>

      {message && <p className="admin-flash admin-flash--success">{message}</p>}
      {error && <p className="admin-flash admin-flash--error">{error}</p>}

      {summary && (
        <section className="admin-metrics">
          <article className="metric-tile metric-tile--lime">
            <span className="metric-label">SCHEDULE ENTRIES</span>
            <strong>{summary.scheduleCount}</strong>
          </article>
          <article className="metric-tile metric-tile--teal">
            <span className="metric-label">VENUES</span>
            <strong>{summary.venueCount}</strong>
          </article>
          <article className="metric-tile metric-tile--purple">
            <span className="metric-label">BATCHES</span>
            <strong>{summary.batches?.length || 0}</strong>
          </article>
          <article className="metric-tile metric-tile--gold">
            <span className="metric-label">NOTIFICATIONS</span>
            <strong>{notifications.length}</strong>
          </article>
        </section>
      )}

      <section className="admin-split">
        <form className="admin-form" onSubmit={createNotification}>
          <h2>Send notification</h2>

          <label className="admin-field admin-field--gold">
            TITLE
            <input
              value={notice.title}
              onChange={(event) => setNotice({ ...notice, title: event.target.value })}
              placeholder="Mid-sem exam schedule released"
              required
            />
          </label>

          <label className="admin-field admin-field--teal">
            MESSAGE
            <textarea
              value={notice.message}
              onChange={(event) => setNotice({ ...notice, message: event.target.value })}
              placeholder="Details every student should read..."
              required
            />
          </label>

          <label className="admin-field admin-field--purple">
            AUDIENCE
            <select value={notice.audience} onChange={(event) => setNotice({ ...notice, audience: event.target.value })}>
              {Object.entries(audienceLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-field-row">
            <label className="admin-field admin-field--lime">
              EVENT DATE
              <input
                type="datetime-local"
                value={notice.eventAt}
                onChange={(event) => setNotice({ ...notice, eventAt: event.target.value })}
              />
            </label>
            <label className="admin-field admin-field--coral">
              EXPIRES
              <input
                type="datetime-local"
                value={notice.expiresAt}
                onChange={(event) => setNotice({ ...notice, expiresAt: event.target.value })}
              />
            </label>
          </div>

          <button type="submit" className="admin-publish-btn" disabled={publishing}>
            {publishing ? "PUBLISHING..." : "PUBLISH TO USERS"}
          </button>
        </form>

        <section className="venue-section">
          <h2>Published notifications</h2>
          <div className="admin-list">
            {notifications.length === 0 && <p className="empty-state">Nothing published yet. Send your first notification.</p>}
            {notifications.map((item) => (
              <article className="admin-row notification-row" key={item._id}>
                <div>
                  <div className="notification-row__top">
                    <strong>{item.title}</strong>
                    <span className={`status-chip ${item.isActive ? "status-chip--live" : "status-chip--off"}`}>
                      {item.isActive ? "LIVE" : "HIDDEN"}
                    </span>
                    <span className="audience-chip">{audienceLabels[item.audience] || item.audience}</span>
                  </div>
                  <span>{item.message}</span>
                  {item.eventAt && <time>Event: {new Date(item.eventAt).toLocaleString()}</time>}
                  {item.expiresAt && <time>Expires: {new Date(item.expiresAt).toLocaleString()}</time>}
                </div>
                <div className="row-actions">
                  <button type="button" onClick={() => toggleNotification(item)}>
                    {item.isActive ? "Hide" : "Show"}
                  </button>
                  <button type="button" className="danger-btn" onClick={() => deleteNotification(item)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="venue-section">
        <h2>Timetable data</h2>
        <form className="finder-panel" onSubmit={applyFilters}>
          <label className="field--day">
            DAY
            <select value={filter.day} onChange={(event) => setFilter({ ...filter, day: event.target.value })}>
              <option value="">Any day</option>
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
                <option value={day} key={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className="field--start">
            ROOM
            <input value={filter.roomNo} onChange={(event) => setFilter({ ...filter, roomNo: event.target.value })} placeholder="CR 2" />
          </label>
          <label className="field--duration">
            BATCH
            <input value={filter.batch} onChange={(event) => setFilter({ ...filter, batch: event.target.value })} placeholder="CSE 1" />
          </label>
          <button className="find-btn" type="submit">FILTER SCHEDULES</button>
        </form>

        <div className="admin-list">
          {schedules.map((slot) => (
            <article className="admin-row" key={slot._id}>
              {editingId === slot._id ? (
                <div className="schedule-editor">
                  <input
                    value={scheduleDraft.dayOfWeek}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, dayOfWeek: event.target.value })}
                  />
                  <input
                    type="time"
                    value={scheduleDraft.startTime}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, startTime: event.target.value })}
                  />
                  <input
                    type="time"
                    value={scheduleDraft.endTime}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, endTime: event.target.value })}
                  />
                  <input
                    value={scheduleDraft.roomNo}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, roomNo: event.target.value })}
                  />
                  <input
                    value={scheduleDraft.courseCode}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, courseCode: event.target.value })}
                  />
                  <input
                    value={scheduleDraft.batch}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, batch: event.target.value })}
                  />
                  <textarea
                    value={scheduleDraft.rawText}
                    onChange={(event) => setScheduleDraft({ ...scheduleDraft, rawText: event.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <strong>
                    {slot.roomNo} · {slot.dayOfWeek} {slot.startTime}
                  </strong>
                  <span>
                    {slot.batch} | {slot.courseCode} | {slot.rawText}
                  </span>
                </div>
              )}
              <div className="row-actions">
                {editingId === slot._id ? (
                  <>
                    <button type="button" onClick={() => saveSchedule(slot._id)}>
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => startEditing(slot)}>
                      Edit
                    </button>
                    <button type="button" className="danger-btn" onClick={() => deleteSchedule(slot)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
