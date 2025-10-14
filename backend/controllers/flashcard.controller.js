const flashcard = require('../models/Flashcard.model');

// creates a new flashcard in a flashcard set 
const createFlashcard = (req, res) => {
  res.status(201).json({ message: "Stub: createFlashcard" });
};

// gets a specific flashcard by ID
// not sure if we need this but this uses mongo id to get a specific flashcard
const getFlashcardById = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardById" });
};

// allows a user to change the front and back contents of a specific flashcard by ID
const updateFlashcard = (req, res) => {
  res.status(200).json({ message: "Stub: updateFlashcard" });
};

// deletes a specific flashcard from a set by ID
const deleteFlashcard = (req, res) => {
  res.status(200).json({ message: "Stub: deleteFlashcard" });
};

// retrieves all flashcards associated with a given set
const getFlashcardsBySetId = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardsBySetId" });
};

// export function here when finished
module.exports = {

}
