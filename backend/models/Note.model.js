const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        userId: { // author of the note
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        groupId: { // ensure group-scoped visibility
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseGroup",
            required: true,
        },
        title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100,
        },
        content: {
            type: String,
            required: true, // change to false if you want to allow empty notes
            trim: true,
        },
        images: {
            type: [String], // Array of image URLs or base64 strings
            required: false,
        },
    },
    {timestamps: true} // automates createdAt and updatedAt fields
)

module.exports = mongoose.model("Note", noteSchema);