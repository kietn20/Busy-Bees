const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      required: false,
      trim: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: false,
      minlength: 8,
      select: false,
    },
    registeredCourses: [
      {
        courseId: {
          type: String,
          required: true,
        },
        courseName: {
          type: String,
          required: true,
        },
        favorites: [
          {
            kind: {
              type: String,
              enum: ["note", "flashcardSet"],
              required: true,
            },
            itemId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
            titleSnapshot: {
              type: String,
              required: false,
            },
          },
        ],
        recentlyViewed: [
          {
            kind: {
              type: String,
              enum: ["note", "flashcardSet"],
              required: true,
            },
            itemId: {
              type: mongoose.Schema.Types.ObjectId,
              required: true,
            },
            titleSnapshot: {
              type: String,
              required: false,
            },
            viewedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);