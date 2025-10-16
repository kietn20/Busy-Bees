const express = require('express');
const { loginUser, getCurrentUser, registerUser, googleCallback } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerValidation } = require('../middleware/account.middleware');
const passport = require('passport');

const router = express.Router();

// @route   GET /api/auth/me
// @desc    Get the current logged-in user's data
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  public
router.post('/login', loginUser);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  public
router.post('/register', registerValidation, registerUser);



// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleCallback // Controller handles response after authentication
);


module.exports = router;