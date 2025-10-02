const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');

const router = express.Router();

// @route   GET /api/auth/me
// @desc    Get the current logged-in user's data
// @access  Private
router.get('/me', protect, authController.getCurrentUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  public
router.post('/login', authController.loginUser);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  public
// test accountMiddleware.registerValidation in this route later
router.post('/register', accountController.registerUser);

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback // Controller handles response after authentication
);


module.exports = router;