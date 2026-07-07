import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    facultyName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNo: {
      type: String,
      required: true,
      trim: true,
    },
    group: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { _id: false } // slots don't need their own _id, they're embedded
);

const timetableSlotSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    batch: {
      type: String,
      required: true,
      trim: true,
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
    schedule: {
      type: [scheduleSchema], // array of 6 (Mon-Sat), each either a slot object or null
      default: [null, null, null, null, null, null],
      validate: {
        validator: function (arr) {
          return arr.length === 6;
        },
        message: "Schedule must have exactly 6 entries (Monday to Saturday).",
      },
    },
  },
  { timestamps: true }
);

timetableSlotSchema.index({ user: 1, dayOfWeek: 1, startTime: 1 });

const TimetableSlot = mongoose.model("TimetableSlot", timetableSlotSchema);

export default TimetableSlot;
