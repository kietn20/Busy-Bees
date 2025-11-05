const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getFlashcardSetByGroup, createFlashcardSet, 
      getFlashcardSetById, updateFlashcardSet, deleteFlashcardSet } = require('../controllers/flashcardset.controller');
const { deleteFlashcard, updateFlashcard, getFlashcardById, createFlashcard } = require('../controllers/flashcard.controller');
const { canEditFlashcardSet, canDeleteFlashcardSet, validateFlashcardSet } = require("../middleware/flashcardset.middleware");

const router = express.Router({ mergeParams: true });

// only allow authenticated users (JWT or Google OAuth)
router.use(allowJwtOrGoogle);

// GET /api/groups/:groupId/flashcards - used to display flashcard sets on flashcard home page
router.get('/', getFlashcardSetByGroup);

// GET /api/groups/:groupId/flashcards/:id - get specific flashcard set details
router.get('/:id', getFlashcardSetById);

// GET /api/groups/:groupId/flashcards/cards/:id - get specific flashcard by ID
router.get('/cards/:id', getFlashcardById);

// POST /api/groups/:groupId/flashcards
router.post('/', validateFlashcardSet, createFlashcardSet);

// POST /api/groups/:groupId/flashcards/cards - create a new flashcard in a set
router.post('/cards', createFlashcard);

// PUT /api/groups/:groupId/flashcards/sets/:setId - update a specific flashcard set
router.put('/sets/:setId', canEditFlashcardSet, validateFlashcardSet, updateFlashcardSet);

// PUT /api/groups/:groupId/flashcards/cards/:id
router.put('/cards/:id',  updateFlashcard);

// DELETE /api/groups/:groupId/flashcards/cards/:flashcardId
router.delete('/cards/:flashcardId', canDeleteFlashcardSet, deleteFlashcard);

// DELETE /api/groups/:groupId/flashcards/sets/:setId - delete a specific flashcard set
router.delete('/sets/:setId', deleteFlashcardSet);

module.exports = router;
