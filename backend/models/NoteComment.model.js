const mongoose = require("mongoose");

const noteCommentSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseGroup",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NoteComment",
      default: null,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommentThread",
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
    blockId: {
      type: String,
      required: false,
    },
    metadata: {
      resolved: {
        type: Boolean,
        default: false,
      },
      reactions: [
        {
          emoji: { type: String },
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NoteComment", noteCommentSchema);
