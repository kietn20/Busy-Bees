const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
    {
        term: {
            type: String,
            required: true,
            maxLength: 100
        },
        definition: {
            type: String,
            required: true,
            maxLength: 300
        },
    })

module.exports = mongoose.model("Flashcard", flashcardSchema);