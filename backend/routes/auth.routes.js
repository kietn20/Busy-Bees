const express = require('express');
const { loginUser } = require('../controllers/auth.controller');
const { loginUser, getCurrentUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get the current logged-in user's data
// @access  private
router.get('/me', protect, getCurrentUser);

module.exports = router;