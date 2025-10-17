const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      // required: true, // an event could just have a start time 
    },
    // link to the CourseGroup this event belongs to
    courseGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseGroup",
      required: true,
    },
    // link to the User who created the event
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// indexing for faster queries and this helps MongoDB quickly find all events for a specific group
eventSchema.index({ courseGroup: 1, startTime: 1 });

module.exports = mongoose.model("Event", eventSchema);