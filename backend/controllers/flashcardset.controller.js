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
const getFlashcardSetById = async (req, res) => {
  try {
    const { id } = req.params;

    const flashcardSet = await flashcardset.findById(id);

    if (!flashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }
    res.status(200).json({
      message: "Flashcard set retrieved successfully",
      flashcardSet: flashcardSet
    });
  } catch (error) {
    console.error("Error retrieving flashcard set:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid flashcard set ID" });
    } 
    res.status(500).json({ message: "Internal server error" });
  }
}

// retrieves all flashcard sets associated with a specific course group
const getFlashcardSetByGroup = (req, res) => {
  res.status(200).json({ message: "Stub: getFlashcardSetByGroupId" });
}
