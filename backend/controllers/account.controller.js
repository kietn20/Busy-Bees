const User = require("../models/User.model");
const CourseGroup = require("../models/CourseGroup.model");
const Note = require("../models/Note.model");
const FlashcardSet = require("../models/FlashcardSet.model");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { hashPassword } = require('../utils/password.util');

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;

    // email and password updates are blocked for OAuth users by middleware
    // only non-OAuth users can reach this point
    if (email) updates.email = email;
    if (password) {
      updates.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email
      }
    });
  } catch (err) {
    if (
      err.code === 11000 ||
      (err.message && err.message.includes("E11000"))
    ) {
      return res.status(400).json({ message: "Email already exists." });
    }
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Internal server error." });


  }
};

// NEW: Helper function to clear session for logoutUser and deleteAccount
const clearSession = (req, res, callback) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        if (callback) callback();
      });
    });
  } else {
    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      if (callback) callback();
    });
  }
};
const logoutUser = (req, res) => {
  clearSession(req, res, () => {
    return res.status(200).json({ message: 'Logged out' });
  });
};

const getAccount = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // Normalize user shape for both JWT and OAuth flows
  const normalized = {
    id: req.user._id,
    firstName: req.user.firstName || '',
    lastName: req.user.lastName || '',
    email: req.user.email,
    googleId: req.user.googleId || null
  };
  res.json({ user: normalized });
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // check if user owns any groups
    const ownedGroupsCount = await CourseGroup.countDocuments({ ownerId: userId });

    if (ownedGroupsCount > 0) {
      return res.status(400).json({
        message: `You must transfer ownership of your ${ownedGroupsCount} group(s) before deleting your account. Go to each group's settings to transfer ownership.`,
        ownedGroupsCount
      });
    }

    // remove user from all groups where they're just a member
    const updateResult = await CourseGroup.updateMany(
      { "members.userId": userId },
      { $pull: { members: { userId: userId } } }
    );
    console.log(`Removed user from ${updateResult.modifiedCount} group(s)`);

    // delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // clear the session (for OAuth users)
    clearSession(req, res, () => {
      return res.status(200).json({
        message: 'Account and all associated data deleted successfully'
      });
    });

  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a favorite for the authenticated user under a registered course
const addFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemId } = req.body;

    if (!courseId || !kind || !itemId) {
      return res.status(400).json({ message: 'courseId, kind and itemId are required.' });
    }
    if (!['note', 'flashcardSet'].includes(kind)) {
      return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
    }

    // try to use middleware-loaded user and registeredCourse when available
    const user = req.userDoc || await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = req.registeredCourse || user.registeredCourses.find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    // validate item exists and belongs to course
    let titleSnapshot = '';
    if (kind === 'note') {
      const note = await Note.findById(itemId);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      if (String(note.groupId) !== String(courseId)) return res.status(400).json({ message: 'Note does not belong to course' });
      titleSnapshot = note.title;
    } else {
      // flashcardSet: ensure the set exists and belongs to the course
      const set = await FlashcardSet.findById(itemId);
      if (!set) return res.status(404).json({ message: 'FlashcardSet not found' });
      if (String(set.courseGroupId) !== String(courseId)) return res.status(400).json({ message: 'FlashcardSet does not belong to course' });
      titleSnapshot = set.setName || '';
    }

    // ensure favorites array exists
    if (!Array.isArray(reg.favorites)) reg.favorites = [];

    // check duplicate
    const exists = reg.favorites.some(f => String(f.itemId) === String(itemId) && f.kind === kind);
    if (exists) return res.json({ isFavorited: true });

    // push and save
    reg.favorites.push({ kind, itemId: new mongoose.Types.ObjectId(itemId), titleSnapshot });
    await user.save();

    return res.json({ isFavorited: true });
  } catch (err) {
    console.error('Error adding favorite:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a favorite for the authenticated user under a registered course
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemId } = req.body;

    if (!courseId || !kind || !itemId) {
      return res.status(400).json({ message: 'courseId, kind and itemId are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = user.registeredCourses.find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    if (!Array.isArray(reg.favorites)) reg.favorites = [];

    const beforeLen = reg.favorites.length;
    reg.favorites = reg.favorites.filter(f => !(String(f.itemId) === String(itemId) && f.kind === kind));

    if (reg.favorites.length === beforeLen) return res.json({ isFavorited: false });

    await user.save();
    return res.json({ isFavorited: false });
  } catch (err) {
    console.error('Error removing favorite:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get favorites for a course (optionally filtered by kind)
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind } = req.query;

    if (!courseId) return res.status(400).json({ message: 'courseId query param is required' });

    // Try to use middleware-provided user/registeredCourse when present
    let user = req.userDoc;
    if (!user) {
      // Project only the matching registeredCourses element to keep payload small
      user = await User.findOne(
        { _id: userId, 'registeredCourses.courseId': courseId },
        { 'registeredCourses.$': 1 }
      );
    }

    if (!user || !Array.isArray(user.registeredCourses) || user.registeredCourses.length === 0) {
      return res.json({ courseId, kind: kind || null, favorites: [] });
    }

    const reg = req.registeredCourse || user.registeredCourses[0];
    const favorites = Array.isArray(reg.favorites) ? reg.favorites : [];

    const filtered = kind ? favorites.filter(f => f.kind === kind) : favorites;

    // return minimal shape
    const result = filtered.map(f => ({ itemId: String(f.itemId), kind: f.kind, titleSnapshot: f.titleSnapshot || '' }));

    return res.json({ courseId, kind: kind || null, favorites: result });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk-check: given a list of itemIds, return which ones are favorited by the user for a course/kind
// Projected use: favorite buttons (the hearts or stars) on a list of notes/flashcard sets
const checkFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemIds } = req.body;

    if (!courseId || !kind || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'courseId, kind and itemIds(array) are required in body' });
    }
    if (!['note', 'flashcardSet'].includes(kind)) {
      return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
    }

    // Try to use middleware-provided user/registeredCourse when present
    let user = req.userDoc;
    if (!user) {
      // Project only the matching registeredCourses element to keep payload small
      user = await User.findOne(
        { _id: userId, 'registeredCourses.courseId': courseId },
        { 'registeredCourses.$': 1 }
      );
    }

    if (!user || !Array.isArray(user.registeredCourses) || user.registeredCourses.length === 0) {
      // none favorited
      const emptyResults = {};
      itemIds.forEach(id => (emptyResults[id] = false));
      return res.json({ courseId, kind, results: emptyResults });
    }

    const reg = req.registeredCourse || user.registeredCourses[0];
    const favorites = Array.isArray(reg.favorites) ? reg.favorites : [];
    const favSet = new Set(favorites.filter(f => f.kind === kind).map(f => String(f.itemId)));

    const results = {};
    itemIds.forEach(id => {
      results[id] = favSet.has(String(id));
    });

    return res.json({ courseId, kind, results });
  } catch (err) {
    console.error('Error in checkFavorites:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// recently viewed controller functions
const MAX_RECENT = 7;

const addRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemId } = req.body;

    // validate input
    if (!courseId || !kind || !itemId) {
      return res.status(400).json({ message: 'courseId, kind and itemId are required.' });
    }
    if (!['note', 'flashcardSet'].includes(kind)) {
      return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
    }

    // Find user and registered course
    const user = req.userDoc || await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = req.registeredCourse || user.registeredCourses.find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    // validate item exists and get titleSnapshot
    let titleSnapshot = '';
    if (kind === 'note') {
      const note = await Note.findById(itemId);
      if (!note) return res.status(404).json({ message: 'Note not found' });
      titleSnapshot = note.title;
    } else {
      const set = await FlashcardSet.findById(itemId);
      if (!set) return res.status(404).json({ message: 'FlashcardSet not found' });
      titleSnapshot = set.setName || '';
    }

    // Ensure recentlyViewed array exists
    if (!Array.isArray(reg.recentlyViewed)) reg.recentlyViewed = [];

    // Remove if already exists
    reg.recentlyViewed = reg.recentlyViewed.filter(rv => !(String(rv.itemId) === String(itemId) && rv.kind === kind));

    // Add to front of array
    reg.recentlyViewed.unshift({ kind, itemId: new mongoose.Types.ObjectId(itemId), titleSnapshot, viewedAt: new Date() });

    // Trim array to MAX_RECENT
    reg.recentlyViewed = reg.recentlyViewed.slice(0, MAX_RECENT);

    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Error adding recently viewed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const removeRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemId } = req.body;

    if (!courseId || !kind || !itemId) {
      return res.status(400).json({ message: 'courseId, kind and itemId are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = user.registeredCourses.find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    if (!Array.isArray(reg.recentlyViewed)) reg.recentlyViewed = [];

    const beforeLen = reg.recentlyViewed.length;
    reg.recentlyViewed = reg.recentlyViewed.filter(rv => !(String(rv.itemId) === String(itemId) && rv.kind === kind));

    if (reg.recentlyViewed.length === beforeLen) return res.json({ success: false });

    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Error removing recently viewed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
const getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind } = req.query;

    if (!courseId) return res.status(400).json({ message: 'courseId query param is required' });

    // Try to use middleware-provided user/registeredCourse when present
    let user = req.userDoc;
    if (!user) {
      user = await User.findOne(
        { _id: userId, 'registeredCourses.courseId': courseId },
        { 'registeredCourses.$': 1 }
      );
    }

    if (!user || !Array.isArray(user.registeredCourses) || user.registeredCourses.length === 0) {
      return res.json({ courseId, kind: kind || null, recentlyViewed: [] });
    }

    const reg = req.registeredCourse || user.registeredCourses[0];
    const recentlyViewed = Array.isArray(reg.recentlyViewed) ? reg.recentlyViewed : [];

    const filtered = kind ? recentlyViewed.filter(rv => rv.kind === kind) : recentlyViewed;

    // return minimal shape
    const result = filtered.map(rv => ({
      itemId: String(rv.itemId),
      kind: rv.kind,
      titleSnapshot: rv.titleSnapshot || '',
      viewedAt: rv.viewedAt
    }));

    return res.json({ courseId, kind: kind || null, recentlyViewed: result });
  } catch (err) {
    console.error('Error fetching recently viewed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
const checkRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, kind, itemIds } = req.body;

    if (!courseId || !kind || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'courseId, kind and itemIds(array) are required in body' });
    }
    if (!['note', 'flashcardSet'].includes(kind)) {
      return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
    }

    // Try to use middleware-provided user/registeredCourse when present
    let user = req.userDoc;
    if (!user) {
      user = await User.findOne(
        { _id: userId, 'registeredCourses.courseId': courseId },
        { 'registeredCourses.$': 1 }
      );
    }

    if (!user || !Array.isArray(user.registeredCourses) || user.registeredCourses.length === 0) {
      // none recently viewed
      const emptyResults = {};
      itemIds.forEach(id => (emptyResults[id] = false));
      return res.json({ courseId, kind, results: emptyResults });
    }

    const reg = req.registeredCourse || user.registeredCourses[0];
    const recentlyViewed = Array.isArray(reg.recentlyViewed) ? reg.recentlyViewed : [];
    const viewedSet = new Set(recentlyViewed.filter(rv => rv.kind === kind).map(rv => String(rv.itemId)));

    const results = {};
    itemIds.forEach(id => {
      results[id] = viewedSet.has(String(id));
    });

    return res.json({ courseId, kind, results });
  } catch (err) {
    console.error('Error in checkRecentlyViewed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
module.exports = {
  updateUser,
  logoutUser,
  getAccount,
  deleteAccount,
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorites,
  addRecentlyViewed,
  removeRecentlyViewed,
  getRecentlyViewed,
  checkRecentlyViewed
}