const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
    {
        frontDescription: {
            type: String,
            required: true,
        },
        backDescription: {
            type: String,
            required: true,
        },
    })

module.exports = mongoose.model("Flashcard", flashcardSchema);