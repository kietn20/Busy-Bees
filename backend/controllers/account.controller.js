const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");

exports.registerUser = async (req, res) => {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const { userId, firstName, lastName, email, password } = req.body;
  
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = new User({
          userId,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          registeredCourses: [],
        });
  
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
      } catch (err) {
        console.error("Error registering user", err);
        res.status(500).json({ error: "Server error" });
      }
};

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
        updates.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
      console.error("Error in /api/users/:id:", err);
      res.status(500).json({ error: "Server error" });
    }
};

exports.logoutUser = (req, res) => {
  res.status(200).json({ message: "Logged out successfully. Please delete your token on client side." });
};

exports.getAccount = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user: req.user });
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