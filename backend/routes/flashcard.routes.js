const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getFlashcardSetByGroup, createFlashcardSet, getFlashcardSetById } = require('../controllers/flashcardset.controller');
const { deleteFlashcard } = require('../controllers/flashcard.controller');

const router = express.Router({ mergeParams: true });

// only allow authenticated users (JWT or Google OAuth)
router.use(allowJwtOrGoogle);

// GET /api/groups/:groupId/flashcards - used to display flashcard sets on flashcard home page
router.get('/', getFlashcardSetByGroup);

// GET /api/groups/:groupId/flashcards/:id - get specific flashcard set details
router.get('/:id', getFlashcardSetById);

// POST /api/groups/:groupId/flashcards
router.post('/', createFlashcardSet);

// DELETE /api/groups/:groupId/flashcards/:id
router.delete('/:id', deleteFlashcard);

module.exports = router;