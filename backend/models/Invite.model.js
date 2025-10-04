// purpose of thie file is defines the schema for storing course group invite codes

const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    courseGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseGroup",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a TTL index on expiresAt
// MongoDB will automatically delete documents from this collection when their 'expiresAt' time is reached
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Invite", inviteSchema);