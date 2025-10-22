const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { requireGroupMember } = require('../middleware/coursegroup.middleware');
const { createNote, getGroupNotes, getNoteById } = require('../controllers/note.controller');

// Router for /api/groups/:groupId/notes
const nestedNotesRouter = express.Router({ mergeParams: true });
nestedNotesRouter.use(allowJwtOrGoogle, requireGroupMember);
nestedNotesRouter.post('/', createNote);           // POST /api/groups/:groupId/notes
nestedNotesRouter.get('/', getGroupNotes);         // GET  /api/groups/:groupId/notes (list all)

// Router for /api/notes/:noteId
const noteRouter = express.Router();
noteRouter.use(allowJwtOrGoogle);  // Require login for accessing a single note
noteRouter.get('/:noteId', getNoteById);           // GET /api/notes/:noteId

module.exports = {
  nestedNotesRouter,
  noteRouter
};
