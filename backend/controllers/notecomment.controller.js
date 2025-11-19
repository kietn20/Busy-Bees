const NoteComment = require("../models/NoteComment.model");
const Note = require("../models/Note.model");
const CourseGroup = require("../models/CourseGroup.model");

// Utility: Convert DB comment → BlockNote-friendly object
function mapComment(comment) {
  return {
    id: comment._id.toString(),
    authorId: comment.userId.toString(),
    content: comment.content,
    parentCommentId: comment.parentCommentId || null,
    threadId: comment.threadId || null,
    blockId: comment.blockId || null,
    metadata: comment.metadata || {},
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: []  // filled later
  };
}

// @desc    Create a comment on a note
// @route   POST /api/groups/:groupId/notes/:noteId/comments
const createComment = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    const userId = req.user._id;

    const {
      content,
      parentCommentId = null,
      threadId = null,
      blockId = null
    } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "Content is required." });
    }

    // Ensure note exists & belongs to this group
    const note = await Note.findById(noteId);
    if (!note || note.groupId.toString() !== groupId) {
      return res.status(404).json({ message: "Note not found in this group." });
    }

    const newComment = await NoteComment.create({
      noteId,
      groupId,
      userId,
      content,
      parentCommentId,
      threadId,
      blockId,
      metadata: {}
    });

    return res.status(201).json({
      message: "Comment created successfully",
      comment: mapComment(newComment)
    });
  } catch (err) {
    console.error("Error creating comment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get all comments for a note (threaded)
// @route   GET /api/groups/:groupId/notes/:noteId/comments
const getCommentsForNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;

    const comments = await NoteComment.find({ noteId, groupId }).sort({
      createdAt: 1
    });

    const mapped = comments.map(mapComment);

    // Build nested tree
    const lookup = {};
    mapped.forEach(c => (lookup[c.id] = c));

    const roots = [];

    mapped.forEach(comment => {
      if (comment.parentCommentId) {
        const parent = lookup[comment.parentCommentId];
        if (parent) parent.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return res.status(200).json({
      message: "Comments fetched successfully",
      comments: roots
    });

  } catch (err) {
    console.error("Error getting comments:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Update a comment
// @route   PATCH /api/groups/:groupId/notes/:noteId/comments/:commentId
// @access  Author only
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const { content, metadata } = req.body;

    const comment = await NoteComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization: only author can edit
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not the author of this comment" });
    }

    if (content) comment.content = content;
    if (metadata) comment.metadata = metadata;

    await comment.save();

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: mapComment(comment)
    });

  } catch (err) {
    console.error("Error updating comment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* -------------------------------------------------------
   UTIL: Recursive delete (delete comment + all replies)
------------------------------------------------------- */
async function deleteSubtree(commentId) {
  const children = await NoteComment.find({ parentCommentId: commentId });

  // Remove kids recursively
  for (const child of children) {
    await deleteSubtree(child._id);
  }

  await NoteComment.findByIdAndDelete(commentId);
}

// @desc    Delete a comment + its replies
// @route   DELETE /api/groups/:groupId/notes/:noteId/comments/:commentId
// @access  Author OR group owner
const deleteComment = async (req, res) => {
  try {
    const { groupId, commentId } = req.params;
    const userId = req.user._id;

    const comment = await NoteComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const group = await CourseGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAuthor = comment.userId.toString() === userId.toString();
    const isOwner = group.ownerId.toString() === userId.toString();

    if (!isAuthor && !isOwner) {
      return res.status(403).json({
        message: "Only the author or the group owner can delete this comment"
      });
    }

    await deleteSubtree(commentId);

    return res.status(200).json({ message: "Comment and replies deleted" });

  } catch (err) {
    console.error("Error deleting comment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createComment,
  getCommentsForNote,
  updateComment,
  deleteComment
};
