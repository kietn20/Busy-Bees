const note = require("../models/Note.model");

// Creates a new note with a specific group, user, title, and content
const createNote = (req, res) => {
    res.status(201).json({ message: "Stub: createNote" });
}

// Updates the content of the note using its noteId and changes the last modified timestamp
const updateNote = (req, res) => {
    res.status(200).json({ message: "Stub: updateNote" });
}

// Deletes the note using its noteId from the database
const deleteNote = (req, res) => {
    res.status(200).json({ message: "Stub: deleteNote" });
}

// Retrieves a note by its noteId attribute
const getNoteById = (req, res) => {
    res.status(200).json({ message: "Stub: getNoteById" });
}

// Fetches all notes associated with a particular group
const getNotesByGroup = (req, res) => {
    res.status(200).json({ message: "Stub: getNotesByGroup" });
}

// Retrieves all notes created by a specific user
const getNotesByUser = (req, res) => {
    res.status(200).json({ message: "Stub: getNotesByUser" });
}

// export functions here when finished
module.exports = {

}