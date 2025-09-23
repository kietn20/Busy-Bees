const express = require('express');
const { loginUser } = require('../controllers/auth.controller');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
router.post('/login', loginUser);

module.exports = router;