const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getAccount, updateUser, logoutUser, deleteAccount, addFavorite, removeFavorite, getFavorites, checkFavorites } = require('../controllers/account.controller');
const { requireFavoriteBody, requireCourseQuery, ensureRegisteredCourse } = require('../middleware/favorites.middleware');
const { updateValidation, preventOAuthEmailPasswordChange } = require('../middleware/account.middleware');

const router = express.Router();


// Apply auth middleware to all account routes
router.use(allowJwtOrGoogle);

// GET /api/account - Get current authenticated user's info
router.get(
  '/', 
  getAccount
);

// PUT /api/account - Update current user's profile
router.put(
  "/update",
  allowJwtOrGoogle,
  updateValidation,
  preventOAuthEmailPasswordChange,
  updateUser
);

// POST logout
// need to add functionality for users authenticated by OAuth/session
router.post("/logout", logoutUser);

// POST /api/account/favorites - add a favorite (body: { courseId, kind, itemId })
router.post(
  "/favorites",
  requireFavoriteBody,
  ensureRegisteredCourse,
  addFavorite
);

// DELETE /api/account/favorites - remove a favorite (body: { courseId, kind, itemId })
router.delete(
  "/favorites",
  requireFavoriteBody,
  ensureRegisteredCourse,
  removeFavorite
);

// GET /api/account/favorites?courseId=xxx[&kind=note|flashcard] - bulk favorites for a course (optional kind)
router.get(
  "/favorites",
  requireCourseQuery,
  ensureRegisteredCourse,
  getFavorites
);

// POST /api/account/favorites/check - bulk-check favorites for a list of itemIds
router.post(
  "/favorites/check",
  requireFavoriteBody,
  ensureRegisteredCourse,
  checkFavorites
);

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete(
  '/', 
  deleteAccount
);

module.exports = router;