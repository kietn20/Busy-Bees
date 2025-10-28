const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getAccount, updateUser, logoutUser, deleteAccount } = require('../controllers/account.controller');
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

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete(
  '/', 
  allowJwtOrGoogle, 
  deleteAccount
);

module.exports = router;