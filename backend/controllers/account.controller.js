const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const { validationResult } = require("express-validator");

exports.registerUser = async (req, res) => {
      try {
          const { firstName, lastName, email, password } = req.body;
      
          // 1. validate input
          if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
          }
      
          // 2. check if user already exist
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
          }
      
          // 3. hash the password
          const hashedPassword = await hashPassword(password);
      
          // 4. Create the new user
          const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
          });
          
          await newUser.save();
          
          // 5. generate a JWT and send response
          const token = generateToken(newUser._id);
          
          newUser.password = undefined;
      
          res.status(201).json({
            token,
            user: {
              id: newUser._id,
              firstName: newUser.firstName,
              email: newUser.email,
            }
          });
      
        } catch (error) {
          console.error('Registration error:', error);
          res.status(500).json({ message: 'Internal server error.' });
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