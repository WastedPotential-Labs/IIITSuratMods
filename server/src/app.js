//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)
import express from "express";
import cors from "cors";
//cors allows frontend and backend to talk when they run on different ports.

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import venueRoutes from "./routes/venue.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();//creates a web server API
//Middleware is code that runs during a request before the final route handler.
app.use(express.json());// adds middleware to parse incoming JSON requests.

const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);

//cors(...)` creates a middleware function.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true//allows cookies and auth headers to be sent in cross-origin requests
  })
);

//app.get` creates a route for HTTP GET requests.
app.get("/", (req, res) => {
  res.json({ message: "IIIT Surat MOD backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error"
  });
});

export default app;
