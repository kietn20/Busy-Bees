const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');
const accountMiddleware = require('../middleware/account.middleware');

const router = express.Router();

// GET /api/account - Get current authenticated user's info
router.get(
  '/', 
  allowJwtOrGoogle, 
  accountController.getAccount
);

// POST /api/account/register - Register a new user
router.post(
  "/register",
  accountMiddleware.registerValidation,
  accountController.registerUser
);

// PUT /api/users/:id - Update user details
router.put(
  "/users/:id",
  accountMiddleware.updateValidation,
  accountController.updateUser
);

// POST logout
// need to add functionality for users authenticated by OAuth/session
router.post("/logout", accountController.logoutUser)

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete(
  '/', 
  allowJwtOrGoogle, 
  accountController.deleteAccount
);

module.exports = router;