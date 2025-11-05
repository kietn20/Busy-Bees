const mongoose = require("mongoose");

const noteCommentSchema = new mongoose.Schema(
    {
        userId: { // author of the note
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        noteId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model(noteComment, noteCommentSchema);
