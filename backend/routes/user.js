const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user.model"); // your schema

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { userId, firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      registeredCourses: [] // empty array at registration
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /api/register:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
