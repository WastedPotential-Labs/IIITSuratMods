import mongoose from "mongoose";

const classScheduleSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true
    },
    program: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: String,
      required: true,
      trim: true
    },
    batch: {
      type: String,
      required: true,
      trim: true
    },
    dayOfWeek: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
      index: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    startMinutes: {
      type: Number,
      required: true,
      index: true
    },
    endMinutes: {
      type: Number,
      required: true,
      index: true
    },
    courseCode: {
      type: String,
      required: true,
      trim: true
    },
    courseName: {
      type: String,
      default: "",
      trim: true
    },
    facultyName: {
      type: String,
      default: "",
      trim: true
    },
    roomNo: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    rawText: {
      type: String,
      required: true,
      trim: true
    },
    isCancelled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

classScheduleSchema.index({ roomNo: 1, dayOfWeek: 1, startMinutes: 1, endMinutes: 1 });
classScheduleSchema.index({ batch: 1, dayOfWeek: 1, startMinutes: 1 });

const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);

export default ClassSchedule;
