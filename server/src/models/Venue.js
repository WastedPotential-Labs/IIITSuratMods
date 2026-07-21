import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    building: {
      type: String,
      default: "",
      trim: true
    },
    type: {
      type: String,
      enum: ["classroom", "lab", "seminar", "other"],
      default: "classroom"
    },
    capacity: {
      type: Number,
      default: null
    },
    notes: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

venueSchema.index({ name: "text", building: "text", notes: "text" });

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
