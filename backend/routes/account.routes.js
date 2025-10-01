const User = require('../models/User.model');
const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');
const { getAccount, deleteAccount } = require('../controllers/account.controller');

const router = express.Router();

// GET /api/account - Get current authenticated user's info
router.get('/', allowJwtOrGoogle, getAccount);

// DELETE /api/account - Delete only users authenticated by OAuth/session
router.delete('/', allowJwtOrGoogle, deleteAccount);

module.exports = router;