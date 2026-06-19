//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  batch: user.batch,
  semester: user.semester
});

const allowedBatches = ["CSE 1", "CSE 2", "MNC", "ECE"];

const allowedSemesters = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
];

const isCollegeEmail = (email) => {
  const domain = process.env.COLLEGE_EMAIL_DOMAIN;
  if (!domain) {
    return true;
  }

  return email.endsWith(`@${domain}`);
};

export const register = async (req, res) => {
  try {
    let { name, username, email, batch, semester, password } = req.body;

    email = email?.trim().toLowerCase();
    username = (username || name)?.trim();
    batch = batch?.trim();
    semester = semester?.trim();

    if (!username || !email || !batch || !semester || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    if (!isCollegeEmail(email)) {
      return res.status(400).json({ message: "Use your college email only" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    if (!allowedBatches.includes(batch)) {
      return res.status(400).json({ message: "Please select a valid batch" });
    }

    if (!allowedSemesters.includes(semester)) {
      return res.status(400).json({ message: "Please select a valid semester" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, batch, semester, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registered successfully",
      user: safeUser(user),
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Logged in successfully",
      user: safeUser(user),
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};
