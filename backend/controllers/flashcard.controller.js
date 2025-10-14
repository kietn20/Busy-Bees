const flashcard = require('../models/Flashcard.model');

// creates a new flashcard in a flashcard set 
exports.createFlashcard = (req, res) => {
  res.status(201).json({ message: "Stub: createFlashcard" });
};

// gets a specific flashcard by ID
// not sure if we need this but this uses mongo id to get a specific flashcard
exports.getFlashcardById = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardById" });
};

// allows a user to change the front and back contents of a specific flashcard by ID
exports.updateFlashcard = (req, res) => {
  res.status(200).json({ message: "Stub: updateFlashcard" });
};

// deletes a specific flashcard from a set by ID
exports.deleteFlashcard = (req, res) => {
  res.status(200).json({ message: "Stub: deleteFlashcard" });
};

// retrieves all flashcards associated with a given set
exports.getFlashcardsBySetId = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardsBySetId" });
};

