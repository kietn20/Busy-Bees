const mongoose = require("mongoose");
const Note = require("../models/Note.model");
const CourseGroup = require("../models/CourseGroup.model");
const User = require("../models/User.model");


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

    // REMOVED CHECK FOR GROUP EXISTENCE AS MIDDLEWARE VALIDATES MEMBERSHIP

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
// @route   PUT /api/groups/:groupId/notes/:noteId
// @access  Private (Author or Collaborator)
const updateNote = async (req, res) => {
  try {
    const { groupId, noteId } = req.params;
    const userId = req.user._id; // from JWT or Google session
    const { title, content, images } = req.body;

    // First, find the note to check permissions
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Ensure note actually belongs to this group
    if (note.groupId.toString() !== groupId) {
      return res.status(403).json({ message: "This note does not belong to this group" });
    }

    // Check if user is the author
    const isAuthor = note.userId.equals(userId);

    // Check if user is a collaborator
    const isCollaborator = note.collaborators?.some(collabId => collabId.equals(userId));

    // Only author or collaborator can edit
    if (!isAuthor && !isCollaborator) {
      return res.status(403).json({ message: "Access denied: You do not have permission to edit this note." });
    }

    // Build update object
    const update = {};
    if (title !== undefined) update.title = title;
    if (content !== undefined) update.content = content;
    if (images !== undefined) update.images = images;

    // Update the note
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $set: update },
      { new: true }
    ).populate("userId", "firstName lastName email");

    res.status(200).json({
      message: "Note updated successfully",
      note: updatedNote,
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
    // noteId can come from either route structure
    const noteId = req.params.noteId || req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: "Invalid noteId" });
    }

    const note = await Note.findById(noteId)
      .populate("userId", "firstName lastName email")
      .populate("collaborators", "firstName lastName email");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // verify that the user requesting the note is a member of the group it belongs to
    const group = await CourseGroup.findById(note.groupId);
    if (!group) {
      return res.status(404).json({ message: "The group for this note could not be found." });
    }

    const isMember = group.members.some(member => member.userId.equals(userId));
    if (!isMember) {
      return res.status(403).json({ message: "Forbidden: You are not a member of this group." });
    }

    // Compute isFavorited for authenticated users
    let isFavorited = false;
    try {
      if (req.user && req.user._id) {
        const user = await User.findOne(
          { _id: req.user._id, 'registeredCourses.courseId': String(note.groupId) },
          { 'registeredCourses.$': 1 }
        );
        if (user && Array.isArray(user.registeredCourses) && user.registeredCourses.length > 0) {
          const reg = user.registeredCourses[0];
          const favorites = Array.isArray(reg.favorites) ? reg.favorites : [];
          isFavorited = favorites.some(f => f.kind === 'note' && String(f.itemId) === String(note._id));
        }
      }
    } catch (e) {
      console.error('Error computing isFavorited for note:', e);
    }

    // Optionally ensure requester is a member of the group (protect earlier via requireGroupMember)
    return res.status(200).json({ note, isFavorited });
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

// @desc    Update the list of collaborators for a note
// @route   PUT /api/groups/:groupId/notes/:noteId/collaborators
// @access  Private (Author Only)
const updateCollaborators = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { collaborators } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(collaborators)) {
      return res.status(400).json({ message: "Collaborators must be an array of user IDs." });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // only the author can manage collaborators
    if (!note.userId.equals(userId)) {
      return res.status(403).json({ message: "Access denied: Only the author can manage collaborators." });
    }

    note.collaborators = collaborators;
    await note.save();

    // return the updated note with populated collaborators and userId
    await note.populate([
      { path: 'collaborators', select: 'firstName lastName email' },
      { path: 'userId', select: 'firstName lastName email' }
    ]);

    res.status(200).json({
      message: "Collaborators updated successfully",
      note,
    });

  } catch (error) {
    console.error("Error updating collaborators:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// export functions here when finished
module.exports = {
  createNote,
  getNotesByGroup,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote,
  updateCollaborators,
};