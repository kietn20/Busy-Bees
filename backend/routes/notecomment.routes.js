// backend/routes/notecomment.routes.js
const express = require("express");
const { allowJwtOrGoogle } = require("../middleware/auth.middleware");
const { requireGroupMember } = require("../middleware/coursegroup.middleware");
const { createComment, deleteComment, getCommentsForNote, updateComment } = require("../controllers/notecomment.controller");

// /api/groups/:groupId/notes/:noteId/comments
const commentsRouter = express.Router({ mergeParams: true });

// All comment routes require login + group membership
commentsRouter.use(allowJwtOrGoogle, requireGroupMember);

// POST /api/groups/:groupId/notes/:noteId/comments
commentsRouter.post("/", createComment);

// GET /api/groups/:groupId/notes/:noteId/comments
commentsRouter.get("/", getCommentsForNote);

// PUT /api/groups/:groupId/notes/:noteId/comments
commentsRouter.patch("/:commentId", updateComment);

// DELETE /api/groups/:groupId/notes/:noteId/comments/:commentId
commentsRouter.delete("/:commentId", deleteComment);

module.exports = commentsRouter;
