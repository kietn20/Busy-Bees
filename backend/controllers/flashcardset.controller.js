const flashcardset = require('../models/FlashcardSet.model');

// creates a new flashcard set in the course group
const createFlashcardSet = async (req, res) => {
  const { userId, setName, description, flashcards } = req.body;

  try {
    const newFlashcardSet = await flashcardset.create({
      userId,
      setName,
      description,
      flashcards
    });

    res.status(201).json({
      message: "Flashcard set created successfully",
      flashcardSet: newFlashcardSet
    });
  } catch (error) {
    console.error("Error creating flashcard set:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// updates the attributes of an existing flashcard set
const updateFlashcardSet = async (req, res) => {
  const { id } = req.params;
  const { setName, description, flashcards } = req.body;

  try {
    const updatedFlashcardSet = await flashcardset.findByIdAndUpdate(
      id,
      { setName, description, flashcards },
      { new: true }
    );

    if (!updatedFlashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.status(200).json({
      message: "Flashcard set updated successfully",
      flashcardSet: updatedFlashcardSet
    });
  } catch (error) {
    console.error("Error updating flashcard set:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// deletes an existing flashcard set from the course group
const deleteFlashcardSet = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFlashcardSet = await flashcardset.findByIdAndDelete(id);

    if (!deletedFlashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.status(200).json({
      message: "Flashcard set deleted successfully",
      flashcardSet: deletedFlashcardSet
    });
  } catch (error) {
    console.error("Error deleting flashcard set:", error);
    res.status(500).json({ message: "Internal server error" });
  }
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
