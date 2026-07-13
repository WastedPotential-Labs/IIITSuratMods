import Notification from "../models/Notification.js";

const notificationFields = ["title", "message", "audience", "eventAt", "expiresAt", "isActive"];

const pickNotificationFields = (body) =>
  Object.fromEntries(notificationFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

export const listPublicNotifications = async (req, res) => {
  const now = new Date();
  const notifications = await Notification.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  })
    .sort({ eventAt: 1, createdAt: -1 })
    .limit(20)
    .lean();

  res.json({ notifications });
};

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({}).sort({ createdAt: -1 }).lean();
  res.json({ notifications });
};

export const createNotification = async (req, res) => {
  const notification = await Notification.create({ ...pickNotificationFields(req.body), createdBy: req.user._id });
  res.status(201).json({ message: "Notification created", notification });
};

export const updateNotification = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, pickNotificationFields(req.body), {
    new: true,
    runValidators: true
  });

  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Notification updated", notification });
};

export const deleteNotification = async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Notification deleted" });
};
