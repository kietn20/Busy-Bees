const flashcard = require('../models/Flashcard.model');

// creates a new flashcard in a flashcard set 
const createFlashcard = async (req, res) => {
  try {

    // deconstruct front and back descriptions from request body
    const { frontDescription, backDescription } = req.body;

    // validate required fields
    if (!frontDescription || !backDescription) {
      return res.status(400).json({ message: 'Front and back descriptions are required.' });
    }
    // create flashcard
    const newFlashcard = new flashcard({
      frontDescription,
      backDescription
    });

    // save flashcard to database
    const savedFlashcard = await newFlashcard.save();

    // respond with the created flashcard
    res.status(201).json({
      message: "Flashcard created successfully",
      flashcard: savedFlashcard
    });

  } catch (error) {
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
    console.error('Error retrieving flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' })
  }
};

// allows a user to change the front and back contents of a specific flashcard by ID
const updateFlashcard = async (req, res) => {
  try {
    // deconstruct the id from the request parameters and the front and back descriptions from the request body
    const { id } = req.params;
    const { frontDescription, backDescription } = req.body;

    // validate required fields
    if (!frontDescription || !backDescription) {
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
    console.error('Error updating flashcard:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// deletes a specific flashcard from a set by ID
const deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;

    // find and delete flashcard by id
    const deletedFlashcard = await flashcard.findByIdAndDelete(id);

    // check if flashcard exists
    if (!deletedFlashcard) {
      return res.status(404).json({ message: 'Flashcard not found.' });
    }
    res.status(200).json({ message: 'Flashcard deleted successfully.' });
  } catch (error) {
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


