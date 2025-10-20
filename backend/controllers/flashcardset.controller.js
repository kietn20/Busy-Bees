const flashcardset = require('../models/FlashcardSet.model');

// creates a new flashcard set in the course group
const createFlashcardSet = async (req, res) => {
  const { userId, courseGroupId, setName, description, flashcards } = req.body;
  
  // validation
  if (!userId || !courseGroupId || !setName) {
    return res.status(400).json({ 
      message: "userId, courseGroupId, and setName are required" 
    });
  }

  try {
    const newFlashcardSet = await flashcardset.create({
      userId,
      courseGroupId,
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

  // validation
  if (!setName && !description && !flashcards) {
    return res.status(400).json({ 
      message: "At least one field (setName, description, or flashcards) must be provided" 
    });
  }

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
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid flashcard set ID format" });
    }   
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
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid flashcard set ID format" });
    }
    console.error("Error deleting flashcard set:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// retrieves a specific flashcard set by its id
// used when a user clicks on a specific flashcard set to study it
const getFlashcardSetById = async (req, res) => {
  try {
    const { id } = req.params;

    // gets the flashcard and populates the flashcards array with full flashcard documents
    // instead of just their IDs
    const flashcardSet = await flashcardset.findById(id).populate('flashcards');

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
// used to display a list of all flashcard sets in a course group
const getFlashcardSetByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // find flashcard sets by courseGroupId 
    const flashcardSets = await flashcardset.find({ courseGroupId: groupId });

    if (!flashcardSets || flashcardSets.length === 0) {
      return res.status(404).json({ 
        message: "No flashcard sets found for this course group" 
      });
    }

    res.status(200).json({
      message: "Flashcard sets retrieved successfully",
      flashcardSets
    });
  } catch (error) {
    console.error("Error retrieving flashcard sets:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid course group ID format" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  getFlashcardSetById,
  getFlashcardSetByGroup
}