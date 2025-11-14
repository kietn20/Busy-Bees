const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getAccount, updateUser, logoutUser, deleteAccount, addFavorite, removeFavorite, getFavorites, checkFavorites } = require('../controllers/account.controller');
const { updateValidation, preventOAuthEmailPasswordChange } = require('../middleware/account.middleware');

const router = express.Router();


// GET /api/account - Get current authenticated user's info
router.get(
  '/', 
  allowJwtOrGoogle, 
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
  allowJwtOrGoogle,
  addFavorite
);

// DELETE /api/account/favorites - remove a favorite (body: { courseId, kind, itemId })
router.delete(
  "/favorites",
  allowJwtOrGoogle,
  removeFavorite
);

// GET /api/account/favorites?courseId=xxx[&kind=note|flashcard] - bulk favorites for a course (optional kind)
router.get(
  "/favorites",
  allowJwtOrGoogle,
  getFavorites
);

// POST /api/account/favorites/check - bulk-check favorites for a list of itemIds
router.post(
  "/favorites/check",
  allowJwtOrGoogle,
  checkFavorites
);

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete(
  '/', 
  allowJwtOrGoogle, 
  deleteAccount
);

module.exports = router;