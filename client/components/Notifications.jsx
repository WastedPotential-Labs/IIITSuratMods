import { useEffect, useState } from "react";
import api from "../src/api";
import "./styling/venues.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api
      .get("/notifications")
      .then((response) => setNotifications(response.data.notifications || []))
      .catch(() => setNotifications([]));
  }, []);

  if (!notifications.length) return null;

  return (
    <section className="notice-strip">
      {notifications.slice(0, 3).map((notification) => (
        <article className="notice-item" key={notification._id}>
          <strong>{notification.title}</strong>
          <span>{notification.message}</span>
          {notification.eventType === "club" && notification.venueName && <span>Venue: {notification.venueName}</span>}
          {notification.eventAt && <time>{new Date(notification.eventAt).toLocaleString()}</time>}
        </article>
      ))}
    </section>
  );
}
