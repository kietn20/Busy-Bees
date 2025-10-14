const User = require("../models/User.model");
const { validationResult } = require("express-validator");
const { hashPassword } = require('../utils/password.util');

exports.updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      const updates = {};

      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (email) updates.email = email;
      if (password) {
        updates.password = await hashPassword(password);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "User updated successfully", 
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email
        }
      });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Internal server error" });
    }
};

exports.logoutUser = (req, res) => {
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
};

exports.getAccount = (req, res) => {
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
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};