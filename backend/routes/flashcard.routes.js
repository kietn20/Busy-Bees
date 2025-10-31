const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getFlashcardSetByGroup, createFlashcardSet } = require('../controllers/flashcardset.controller');

const router = express.Router({ mergeParams: true });

router.use(allowJwtOrGoogle);

// GET /api/groups/:groupId/flashcards - used to display flashcard sets on flashcard home page
//router.get('/', getFlashcardSetByGroup);

// POST /api/groups/:groupId/flashcards
router.post('/', createFlashcardSet);

router.get('/', (req, res, next) => {
  console.log("Route hit, req.params:", req.params);
  next();
}, getFlashcardSetByGroup);

module.exports = router;