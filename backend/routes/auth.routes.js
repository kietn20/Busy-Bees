const express = require('express');
const { body, validationResult } = require('express-validator');
const { loginUser, getCurrentUser, registerUser, updateUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');

const router = express.Router();

// Validation middleware for registration
const registrationValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters"),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

// Validation middleware for user updates
const updateValidation = [
  body("firstName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters"),
  body("lastName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters"),
  body("email").optional().isEmail().withMessage("Enter a valid email"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];




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
router.post('/register', registrationValidation, registerUser);

// @route   PUT /api/auth/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', protect, updateValidation, updateUser);



// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback // Controller handles response after authentication
);


module.exports = router;