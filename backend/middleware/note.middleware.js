const Note = require("../models/Note.model");
const CourseGroup = require("../models/CourseGroup.model");

// allow Author OR Collaborator to edit
const canEditNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // check if user is the author
    const isAuthor = note.userId.equals(userId);

    // AND check if user is in the collaborators list
    const isCollaborator = note.collaborators?.some(collabId => collabId.equals(userId));

    // if neither, deny access
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ message: "Access denied: You do not have permission to edit this note." });
    }

    // Attach note to request for convenience (optional, but good practice)
    req.note = note;
    next();

  } catch (error) {
    console.error("Error in canEditNote middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Author OR Group Owner can delete
const canDeleteNote = async (req, res, next) => {
  try {
    const { groupId, noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAuthor = note.userId.toString() === userId.toString();
    const isGroupOwner = group.ownerId.toString() === userId.toString();

    if (!isAuthor && !isGroupOwner) {
      return res.status(403).json({ message: "Only the author or group owner can delete this note" });
    }

    next();
  } catch (error) {
    console.error("Error in canDeleteNote middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate note input before creating or updating
const validateNote = (req, res, next) => {
  const { title, content, images } = req.body;

  // Validate title
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Title is required." });
  }
  if (title.length > 100) {
    return res.status(400).json({ message: "Title cannot exceed 100 characters." });
  }

  // Validate content
  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ message: "Content is required." });
  }

  // Validate images (optional but if present must be array of strings)
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: "Images must be an array." });
    }
    for (const img of images) {
      if (typeof img !== "string") {
        return res.status(400).json({ message: "Image values must be strings (URLs or base64)." });
      }
    }
  }

  next();
};

module.exports = { 
    canEditNote,
    canDeleteNote,
    validateNote
};
