const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Example route: Public route for testing purposes
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

// Example route: Protected route for testing purposes
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: `Welcome, ${req.user.name}. This is a protected route.` });
});

module.exports = router;
