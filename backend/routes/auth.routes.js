const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth callback
router.get(
  'google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  authController.googleCallback // Controller handles response after authentication
);

module.exports = router;