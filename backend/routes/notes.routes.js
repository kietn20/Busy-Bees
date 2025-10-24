const express = require("express");
const { allowJwtOrGoogle } = require("../middleware/auth.middleware");
const { requireGroupMember } = require("../middleware/coursegroup.middleware");
const { createNote, getNotesByGroup, getNotesByUser, getNoteById, updateNote, deleteNote } = require("../controllers/notes.controller");
const { canEditNote, canDeleteNote, validateNote } = require("../middleware/note.middleware");


// Nested router (for /api/groups/:groupId/notes)
const nestedNotesRouter = express.Router({ mergeParams: true });

// All nested routes must be logged in + in THIS group
nestedNotesRouter.use(allowJwtOrGoogle, requireGroupMember);

// POST /api/groups/:groupId/notes → create note in group
nestedNotesRouter.post("/", validateNote, createNote);

// GET /api/groups/:groupId/notes → all notes in group
nestedNotesRouter.get("/", getNotesByGroup);

// GET /api/groups/:groupId/notes/users/:userId/notes → specific user’s notes
nestedNotesRouter.get("/users/:userId/notes", getNotesByUser);

// GET /api/groups/:groupId/notes/:noteId → single note view
nestedNotesRouter.get("/:noteId", getNoteById);

// Update a note (only by author)
nestedNotesRouter.put("/:noteId", canEditNote, validateNote, updateNote);

// Delete a note (only author OR group owner)
nestedNotesRouter.delete("/:noteId", canDeleteNote, deleteNote);

// Top-Level router (for /api/notes)
// still enforces login + group membership!
const noteRouter = express.Router();
noteRouter.use(allowJwtOrGoogle); // must be logged in

// GET /api/notes/:noteId → validate user belongs to THAT note’s group
noteRouter.get("/:noteId", getNoteById); // same controller, but controller MUST verify group access

module.exports = {
  nestedNotesRouter,
  noteRouter,
};