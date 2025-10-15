const flashcardset = require('../models/FlashcardSet.model');

// creates a new flashcard set in the course group
const createFlashcardSet = (req, res) => {
  res.status(201).json({ message: "Stub: createFlashcardSet" });
}

// updates the attributes of an existing flashcard set
const updateFlashcardSet = (req, res) => {
  res.status(200).json({ message: "Stub: updateFlashcardSet" });
}

// deletes an existing flashcard set from the course group
const deleteFlashcardSet = (req, res) => {
  res.status(200).json({ message: "Stub: deleteFlashcardSet" });
}

// retrieves a specific flashcard set by its id
const getFlashcardSetById = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardSetById" });
}
 // retrieves all flashcard sets associated with a specific course group
const getFlashcardSetByGroup = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardSetByGroupId" });
}

// export function here when finished
module.exports = {

}