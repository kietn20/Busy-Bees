const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getAccount, updateUser, logoutUser, deleteAccount, addFavorite, removeFavorite, getFavorites, checkFavorites,
        addRecentlyViewed, removeRecentlyViewed, getRecentlyViewed, checkRecentlyViewed
      } = require('../controllers/account.controller');
const { requireFavoriteBody } = require('../middleware/favorites.middleware');
const { updateValidation, preventOAuthEmailPasswordChange,  } = require('../middleware/account.middleware');
const { requireRecentlyViewedBody } = require('../middleware/recentlyviewed.middleware');
const { requireCourseQuery, ensureRegisteredCourse } = require('../middleware/coursegroup.middleware');

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

// POST /api/account/recently-viewed - add a recently viewed item (body: { courseId, kind, itemId })
router.post(
  "/recently-viewed",
  requireRecentlyViewedBody,
  ensureRegisteredCourse,
  addRecentlyViewed
);

// DELETE /api/account/recently-viewed - remove a recently viewed item (body: { courseId, kind, itemId })
router.delete(
  "/recently-viewed",
  requireRecentlyViewedBody,
  ensureRegisteredCourse,
  removeRecentlyViewed
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

// GET /api/account/recently-viewed?courseId=xxx[&kind=note|flashcard] - bulk recently viewed items for a course (optional kind)
router.get(
  "/recently-viewed",
  requireCourseQuery,
  ensureRegisteredCourse,
  getRecentlyViewed
);

// POST /api/account/favorites/check - bulk-check favorites for a list of itemIds
router.post(
  "/favorites/check",
  requireFavoriteBody,
  ensureRegisteredCourse,
  checkFavorites
);

// POST /api/account/recently-viewed/check - bulk-check recently viewed for a list of itemIds
router.post(
  "/recently-viewed/check",
  requireRecentlyViewedBody,
  ensureRegisteredCourse,
  checkRecentlyViewed
);

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete(
  '/', 
  deleteAccount
);

module.exports = router;