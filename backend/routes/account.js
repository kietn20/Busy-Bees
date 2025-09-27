import User from '../models/User.js';

const express = require('express');

const router = express.Router();

// DELETE /api/account/:id - Delete user account by ID
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
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