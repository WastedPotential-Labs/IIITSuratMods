import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    audience: {
      type: String,
      enum: ["all", "cse", "ece", "mtech", "admins"],
      default: "all"
    },
    eventType: {
      type: String,
      enum: ["club", "other"],
      default: "other"
    },
    venueName: {
      type: String,
      default: "",
      trim: true
    },
    eventDurationMinutes: {
      type: Number,
      default: 60,
      min: 15
    },
    eventAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.index({ isActive: 1, eventType: 1, venueName: 1, expiresAt: 1, eventAt: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
