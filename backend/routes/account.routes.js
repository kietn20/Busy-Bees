const User = require('../models/User.model');
const express = require('express');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/account - Get current authenticated user's info
router.get('/', allowJwtOrGoogle, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // Normalize user shape for both JWT and OAuth flows
  const normalized = {
    id: req.user._id,
    firstName: req.user.firstName || '',
    email: req.user.email,
  };
  res.json({ user: normalized });
});

// DELETE /api/account - Delete current authenticated user's account
router.delete('/', allowJwtOrGoogle, async (req, res) => {
  try {
    const userId = req.user._id; // get userId from authenticated user
    const deletedUser = await User.findByIdAndDelete(userId); // delete user in MongoDB

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;