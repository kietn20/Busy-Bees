const flashcardset = require('../models/FlashcardSet.model');

// creates a new flashcard set in the course group
exports.createFlashcardSet = (req, res) => {
  res.status(201).json({ message: "Stub: createFlashcardSet" });
}

// updates the attributes of an existing flashcard set
exports.updateFlashcardSet = (req, res) => {
  res.status(200).json({ message: "Stub: updateFlashcardSet" });
}

// deletes an existing flashcard set from the course group
exports.deleteFlashcardSet = (req, res) => {
  res.status(200).json({ message: "Stub: deleteFlashcardSet" });
}

// retrieves a specific flashcard set by its id
exports.getFlashcardSetById = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardSetById" });
}
 // retrieves all flashcard sets associated with a specific course group
exports.getFlashcardSetByGroup = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardSetByGroupId" });
}