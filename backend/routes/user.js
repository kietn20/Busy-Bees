const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/user.model");

const router = express.Router();

router.post(
  "/register",
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("firstName")
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ max: 50 })
      .withMessage("First name must be at most 50 characters"),
    body("lastName")
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ max: 50 })
      .withMessage("Last name must be at most 50 characters"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password")
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character"
      ),
  ],
  async (req, res) => {
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
  }
);

router.put(
  "/users/:id",
  [
    body("firstName")
      .optional()
      .isLength({ max: 50 })
      .withMessage("First name must be at most 50 characters"),
    body("lastName")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Last name must be at most 50 characters"),
    body("email").optional().isEmail().withMessage("Enter a valid email"),
    body("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
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
  }
);

// Simple logout
router.post("/logout", (req, res) => {
  // Tells client to remove token
  res.status(200).json({ message: "Logged out successfully. Please delete your token on client side." });
});

module.exports = router;
