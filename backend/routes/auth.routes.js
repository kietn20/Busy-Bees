const express = require('express');
const { loginUser, getCurrentUser, registerUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

const router = express.Router();


// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  public
router.post('/login', loginUser);


// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  'google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback // Controller handles response after authentication
);

module.exports = router;