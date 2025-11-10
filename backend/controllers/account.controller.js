const User = require("../models/User.model");
const CourseGroup = require("../models/CourseGroup.model");
const { validationResult } = require("express-validator");
const { hashPassword } = require('../utils/password.util');

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, password } = req.body;
      const updates = {};

      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;

      // email and password updates are blocked for OAuth users by middleware
      // only non-OAuth users can reach this point
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
      if (
        err.code === 11000 ||
        (err.message && err.message.includes("E11000"))
      ) {
        return res.status(400).json({ message: "Email already exists." });
      }
      console.error("Error updating user:", err);
      return res.status(500).json({ message: "Internal server error." });
      
      
    }
};

// NEW: Helper function to clear session for logoutUser and deleteAccount
const clearSession = (req, res, callback) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        if (callback) callback();
      });
    });
  } else {
    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      if (callback) callback();
    });
  }
};
const logoutUser = (req, res) => {
    clearSession(req, res, () => {
    return res.status(200).json({ message: 'Logged out' });
  });
};

const getAccount = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // Normalize user shape for both JWT and OAuth flows
  const normalized = {
    id: req.user._id,
    firstName: req.user.firstName || '',
    lastName: req.user.lastName || '',
    email: req.user.email,
    googleId: req.user.googleId || null
  };
  res.json({ user: normalized });
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // check if user owns any groups
    const ownedGroupsCount = await CourseGroup.countDocuments({ ownerId: userId });

    if (ownedGroupsCount > 0) {
      return res.status(400).json({ 
        message: `You must transfer ownership of your ${ownedGroupsCount} group(s) before deleting your account. Go to each group's settings to transfer ownership.`,
        ownedGroupsCount
      });
    }

    // remove user from all groups where they're just a member
    const updateResult = await CourseGroup.updateMany(
      { "members.userId": userId },
      { $pull: { members: { userId: userId } } }
    );
    console.log(`Removed user from ${updateResult.modifiedCount} group(s)`);

    // delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // clear the session (for OAuth users)
    clearSession(req, res, () => {
      return res.status(200).json({ 
        message: 'Account and all associated data deleted successfully' 
      });
    });

  } catch (error) {
    console.error('Error deleting user account:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  updateUser,
  logoutUser,
  getAccount,
  deleteAccount
}