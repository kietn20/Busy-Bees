const FlashcardSet = require("../models/FlashcardSet.model");
const CourseGroup = require("../models/CourseGroup.model");

// Only the author of the flashcard set can edit
const canEditFlashcardSet = async (req, res, next) => {
  try {
    const { setId } = req.params;
    const userId = req.user._id;

    const flashcardSet = await FlashcardSet.findById(setId);
    if (!flashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    if (flashcardSet.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not the author of this flashcard set" });
    }

    next();
  } catch (error) {
    console.error("Error in canEditFlashcardSet middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Author OR Group Owner can delete
const canDeleteFlashcardSet = async (req, res, next) => {
  try {
    const { groupId, setId } = req.params;
    const userId = req.user._id;

    const flashcardSet = await FlashcardSet.findById(setId);
    if (!flashcardSet) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAuthor = flashcardSet.userId.toString() === userId.toString();
    const isGroupOwner = group.ownerId.toString() === userId.toString();

    if (!isAuthor && !isGroupOwner) {
      return res.status(403).json({
        message: "Only the author or the group owner can delete this flashcard set",
      });
    }

    next();
  } catch (error) {
    console.error("Error in canDeleteFlashcardSet middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate flashcard set input before creating or updating
const validateFlashcardSet = (req, res, next) => {
  const { title, description, cards } = req.body;

  // Validate title
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required." });
  }
  if (title.length > 100) {
    return res.status(400).json({ message: "Title cannot exceed 100 characters." });
  }

  // Validate description
  if (description && typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string." });
  }

  for (const card of cards) {
    if (typeof card !== "object" || !card.question || !card.answer) {
      return res.status(400).json({ message: "Each card must have a question and an answer." });
    }
    if (typeof card.question !== "string" || typeof card.answer !== "string") {
      return res.status(400).json({ message: "Question and answer must be strings." });
    }
  }

  next();
};

module.exports = {
  canEditFlashcardSet,
  canDeleteFlashcardSet,
  validateFlashcardSet,
};
