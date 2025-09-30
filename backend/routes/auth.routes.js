const express = require('express');
const { loginUser, getCurrentUser, registerUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

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
router.post('/register', registerUser);





// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback // Controller handles response after authentication
);

// Logout for OAuth session-based users
router.post('/logout', (req, res) => {
  if (req.logout) {
    req.logout(function () {
      req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out' });
      });
    });
  } else {
    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out' });
    });
  }
});

module.exports = router;