const Note = require("../models/Note.model");
const CourseGroup = require("../models/CourseGroup.model");

// @desc    Create a new note in a group
// @route   POST /api/groups/:groupId/notes
// @access  Private (Group Members)
const createNote = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, content, images } = req.body;
    const userId = req.user && req.user._id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required." });
    }

    // Validate group
    const group = await CourseGroup.findById(groupId);
    if (!group) { 
        return res.status(404).json({ message: "Course group not found." });
    }

    // Ensure requester is a member of the group
    const isMember = group.members.some(m => m.equals(userId));
    if (!isMember) {
        return res.status(403).json({ message: "You are not a member of this group." });
    }

    const newNote = await Note.create({
      userId,
      groupId,
      title: title.trim(),
      content: content.trim(),
      images: Array.isArray(images) ? images : (images ? [images] : [])
    });

    return res.status(201).json({ message: "Note created successfully", note: newNote });
  } catch (err) {
    console.error("Error creating note:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// @desc    Update an existing note
// @route   PUT /api/groups/:groupId/notes
// @access  Private (Author)
const updateNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    const userId = req.user._id; // from JWT or Google session
    const { title, content, images } = req.body;

    // 1. Find the note
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // 2. Ensure note actually belongs to this group
    if (note.groupId.toString() !== groupId) {
      return res.status(403).json({ message: "This note does not belong to this group" });
    }

    // 3. Ensure only the **author** can edit it
    if (note.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not the author of this note" });
    }

    // 4. Apply updates
    if (title) {
        note.title = title;
    }
    if (content) {
        note.content = content;
    }
    if (images) {
        note.images = images;
    }

    await note.save();

    res.status(200).json({
      message: "Note updated successfully",
      note,
    });

  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete an existing note
// @route   DELETE /api/groups/:groupId/notes/:noteId
// @access  Private (Author or Group Owner)
const deleteNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    const userId = req.user._id;

    // 1. Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // 2. Verify the note belongs to the correct group
    if (note.groupId.toString() !== groupId) {
      return res.status(403).json({ message: "This note does not belong to this group" });
    }

    // 3. Fetch the group to check if current user is the owner
    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isAuthor = note.userId.toString() === userId.toString();
    const isGroupOwner = group.ownerId.toString() === userId.toString();

    // 4. Allow delete only if author or owner
    if (!isAuthor && !isGroupOwner) {
      return res.status(403).json({ message: "Only the author or group owner can delete this note" });
    }

    // 5. Delete the note
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({
      message: "Note deleted successfully",
      deletedNoteId: noteId,
    });

  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a specific note
// @route   GET /api/groups/:groupId/notes/:noteId
// @access  Private (Group Members)
const getNoteById = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid noteId" });
    }

    const note = await Note.findById(noteId).populate("userId", "firstName lastName email");
    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    // Ensure note belongs to this group
    if (!note.groupId.equals(groupId)) {
      return res.status(404).json({ message: "Note not found in this group." });
    }

    // Optionally ensure requester is a member of the group (protect earlier via requireGroupMember)
    return res.status(200).json({ note });
  } catch (err) {
    console.error("getNoteById error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @desc    Get all notes in a group
// @route   GET /api/groups/:groupId/notes
// @access  Private (Group Members)
const getNotesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const notes = await Note.find({ groupId: groupId })
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all notes written by a specific user within the current course group
// @route   GET /api/groups/:groupId/users/:userId/notes
// @access  Private (Group Members)
const getNotesByUser = async (req, res) => {
    try {
    const { groupId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: "Course group not found." });
    }

    // Only allow if both the requester and the target user are members of the group
    const requesterId = req.user && req.user._id;
    const requesterIsMember = group.members.some(m => m.equals(requesterId));
    const targetIsMember = group.members.some(m => m.equals(userId));

    if (!requesterIsMember) {
        return res.status(403).json({ message: "You are not a member of this group." });
    }
    if (!targetIsMember) {
        return res.status(404).json({ message: "Target user is not a member of this group." });
    }

    const notes = await Note.find({ groupId, userId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    if (!notes || notes.length === 0) {
      return res.status(200).json({ notes: [] }); // empty array is fine
    }

    return res.status(200).json({ notes });
  } catch (err) {
    console.error("Error getting notes:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// export functions here when finished
module.exports = {
  createNote,
  getNotesByGroup,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote
};