const express = require('express');
const { loginUser, getCurrentUser, registerUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();


// @route   POST /api/auth/login
// @desc    Authenticate a user and return a token
// @access  public
router.post('/login', loginUser);


module.exports = router;