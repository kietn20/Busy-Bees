const mongoose = require("mongoose");

const flashcardSetSchema = new mongoose.Schema(
    {
        userId: { // creator of the flashcard set
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        setName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        flashcards: [ // get length of this array to know number of flashcards in the set
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Flashcard",
            },
        ],
    },
    { timestamps: true } // automatically adds createdAt and updatedAt fields
)

module.exports = mongoose.model("FlashcardSet", flashcardSetSchema);