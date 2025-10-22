const Note = require("../models/Note.model");
const CourseGroup = require("../models/CourseGroup.model");

// @desc    Create a new note in a group
// @route   POST /api/groups/:groupId/notes
// @access  Private (Group Members)
const createNote = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Course group not found." });
    }

    // only members can post notes
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group." });
    }

    const newNote = await Note.create({
      userId: req.user._id, // ✅ matches your schema
      title,
      content,
      images: images || [] // optional
    });

    res.status(201).json({ message: "Note created successfully", note: newNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an existing note
// @route   POST /api/groups/:groupId/notes
// @access  Private (Group Members)
const updateNote = (req, res) => {
    res.status(200).json({ message: "Stub: updateNote" });
}

// @desc    Delete an existing note
// @route   POST /api/groups/:groupId/notes
// @access  Private (Group Members)
const deleteNote = (req, res) => {
    res.status(200).json({ message: "Stub: deleteNote" });
}

// @desc    Get a specific note
// @route   GET /api/notes/:noteId
// @access  Private (Group Members)
const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId).populate("userId", "firstName lastName email");

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ note });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all notes in a group
// @route   GET /api/groups/:groupId/notes
// @access  Private (Group Members)
const getNotesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Course group not found." });
    }

    const notes = await Note.find({ userId: { $in: group.members } })
      .sort({ createdAt: -1 });

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all notes written by a specific user
// @route   GET /api/groups/:groupId/notes
// @access  Private (Group Members)
const getNotesByUser = (req, res) => {
    res.status(200).json({ message: "Stub: getNotesByUser" });
}

// export functions here when finished
module.exports = {
  createNote,
  getNotesByGroup,
  getNoteById
};