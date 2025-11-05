// Validate individual flashcard input before creating or updating
const validateFlashcard = (req, res, next) => {
  const { term, definition } = req.body;

  // Check that 'term' exists and is a valid string
  if (!term || typeof term !== "string" || term.trim() === "") {
    return res.status(400).json({ message: "Flashcard term is required." });
  }

  // Enforce max length for 'term'
  if (term.length > 100) {
    return res
      .status(400)
      .json({ message: "Flashcard term cannot exceed 100 characters." });
  }

  // Check that 'definition' exists and is a valid string
  if (!definition || typeof definition !== "string" || definition.trim() === "") {
    return res
      .status(400)
      .json({ message: "Flashcard definition is required." });
  }

  // Enforce max length for 'definition'
  if (definition.length > 300) {
    return res.status(400).json({
      message: "Flashcard definition cannot exceed 300 characters.",
    });
  }

  // If everything is valid, continue to the next middleware
  next();
};

module.exports = {
  validateFlashcard,
};