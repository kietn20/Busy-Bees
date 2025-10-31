const flashcardset = require('../models/FlashcardSet.model');
const flashcard = require('../models/Flashcard.model');
const mongoose = require('mongoose');

// creates a new flashcard set in the course group
const createFlashcardSet = async (req, res) => {
  const userId = req.user._id; // from auth middleware
  const { courseGroupId, setName, description, flashcards } = req.body;
  
  // validation
  if (!userId || !courseGroupId || !setName) {
    return res.status(400).json({ 
      message: "userId, courseGroupId, and setName are required" 
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let flashcardsIds = [];
    if (Array.isArray(flashcards) && flashcards.length > 0) {
      // Validate each flashcard
      for (const f of flashcards) {
        if (!f.term || !f.definition) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: "Each flashcard must have a term and definition." });
        }
      }

      const created = await flashcard.insertMany(
        flashcards.map(f => ({
          term: f.term,
          definition: f.definition
        })),
        { session }
      );
      flashcardsIds = created.map(f => f._id);
    }

    const newFlashcardSet = await flashcardset.create([{
      userId,
      courseGroupId,
      setName,
      description,
      flashcards: flashcardsIds
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      message: "Flashcard set created successfully",
      flashcardSet: newFlashcardSet[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating flashcard set:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// updates the attributes of an existing flashcard set
const updateFlashcardSet = async (req, res) => {
  const id = req.params.setId;
  const { setName, description, flashcards } = req.body;
  console.log("req.params:", req.params);
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
    const set = await flashcardset.findById(id);
    if (!set) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    // deletes all flashcards associated with this set
    await flashcard.deleteMany({ _id: { $in: set.flashcards } });

    // deletes the set 
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

    console.log("groupId param:", groupId, "typeof:", typeof groupId, "length:", groupId.length, "isValid:", mongoose.isValidObjectId(groupId));

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Invalid course group ID format" });
    }

    const flashcardSets = await flashcardset.find({
      courseGroupId: groupId
    }).populate("userId", "firstName lastName");

    if (!flashcardSets || flashcardSets.length === 0) {
      return res.status(404).json({ message: "No flashcard sets found for this course group" });
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