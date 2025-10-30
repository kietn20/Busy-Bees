const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
    {
        term: {
            type: String,
            required: true,
        },
        definition: {
            type: String,
            required: true,
        },
    })

module.exports = mongoose.model("Flashcard", flashcardSchema);