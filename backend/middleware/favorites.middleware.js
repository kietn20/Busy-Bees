const mongoose = require('mongoose');
const User = require('../models/User.model');
const Note = require('../models/Note.model');
const FlashcardSet = require('../models/FlashcardSet.model');

// Middleware to validate favorite payload in body for add/remove/check
async function requireFavoriteBody(req, res, next) {
  const { courseId, kind, itemId, itemIds } = req.body || {};

  // For bulk-check, itemIds is expected (array). For add/remove, itemId is required.
  const isCheck = Array.isArray(itemIds);

  if (!courseId || !kind) {
    return res.status(400).json({ message: 'courseId and kind are required' });
  }

  if (!['note', 'flashcardSet'].includes(kind)) {
    return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
  }

  if (isCheck) {
    if (!Array.isArray(itemIds)) return res.status(400).json({ message: 'itemIds must be an array' });
    req.favorite = { courseId, kind, itemIds };
  } else {
    if (!itemId) return res.status(400).json({ message: 'itemId is required' });
    req.favorite = { courseId, kind, itemId };
  }

  next();
}

// Middleware to validate courseId from query (for GET /favorites)
function requireCourseQuery(req, res, next) {
  const { courseId, kind } = req.query || {};
  if (!courseId) return res.status(400).json({ message: 'courseId query param is required' });
  if (kind && !['note', 'flashcardSet'].includes(kind)) {
    return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
  }
  req.favoriteQuery = { courseId, kind };
  next();
}

// Middleware to load the user's registered course entry and user doc
async function ensureRegisteredCourse(req, res, next) {
  try {
    const courseId = req.favorite?.courseId || req.favoriteQuery?.courseId;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = (user.registeredCourses || []).find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    // attach for controllers to use
    req.userDoc = user;
    req.registeredCourse = reg;
    next();
  } catch (err) {
    console.error('ensureRegisteredCourse error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  requireFavoriteBody,
  requireCourseQuery,
  ensureRegisteredCourse,
};
