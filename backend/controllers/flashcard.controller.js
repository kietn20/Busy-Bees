const flashcard = require('../models/Flashcard.model');
const flashcardset = require('../models/FlashcardSet.model');

// creates a new flashcard in a flashcard set 
const createFlashcard = async (req, res) => {
  try {

    // deconstruct term and definition from request body
    const { term, definition } = req.body;

    // validate required fields
    if (!term || !definition) {
      return res.status(400).json({ message: 'Term and definition are required.' });
    }

    // create and save flashcard to database
    const savedFlashcard = await flashcard.create({
      term,
      definition
    });

    // respond with the created flashcard
    res.status(201).json({
      message: "Flashcard created successfully",
      flashcard: savedFlashcard
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format.' });
    }
    console.error('Error creating flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// gets a specific flashcard by ID
// not sure if we need this but this uses mongo id to get a specific flashcard
const getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params; // mongo id

    const foundFlashcard = await flashcard.findById(id);

    if (!foundFlashcard) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }

    res.status(200).json({
      message: "Flashcard retrieved successfully",
      flashcard: foundFlashcard
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format.' });
    }
    console.error('Error retrieving flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// allows a user to change the front and back contents of a specific flashcard by ID
const updateFlashcard = async (req, res) => {
  try {
    // deconstruct the id from the request parameters and the front and back descriptions from the request body
    const { id } = req.params;
    const { frontDescription, backDescription } = req.body;

    // validate required fields
    if (!frontDescription && !backDescription) {
      return res.status(400).json({ message: 'Front and back descriptions are required.' });
    }

    // create update object with provided fields
    const updateFields = {};
    if (frontDescription) updateFields.frontDescription = frontDescription;
    if (backDescription) updateFields.backDescription = backDescription;

    // find flashcard by id and update it

    const updatedFlashcard = await flashcard.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true } // return the updated document and run validators
    );

    if (!updatedFlashcard) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }

    res.status(200).json({
      message: "Flashcard updated successfully",
      flashcard: updatedFlashcard
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format.' });
    }
    console.error('Error updating flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// deletes a specific flashcard from a set by ID
const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFlashcard = await flashcard.findByIdAndDelete(id);

    if (!deletedFlashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    // remove this flashcard's ID from all sets that reference it
    await flashcardset.updateMany(
      { flashcards: id },
      { $pull: { flashcards: id } }
    );

    res.status(200).json({
      message: "Flashcard deleted successfully",
      flashcard: deletedFlashcard
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format.' });
    }
    console.error('Error deleting flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// retrieves all flashcards associated with a given set
// const getFlashcardsBySetId = async (req, res) => {
// 
// };

module.exports = {
  createFlashcard,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  
}


