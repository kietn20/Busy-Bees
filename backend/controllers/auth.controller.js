const User = require('../models/User.model');
const { comparePassword, hashPassword } = require('../utils/password.util'); 
const { generateToken } = require('../utils/jwt.util');

const registerUser = async (req, res) => {
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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 2. find the user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 3. compare the provided password with the stored hash
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. generate a JWT
    const token = generateToken(user._id);

    // 5. send the token and user info in the response
    user.password = undefined; // set password to undefined so it's not sent back to the client

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user); // we cna just send it back since the user obj is already attached to the req due to our protect middleware
};

// OAuth callback handler
const googleCallback = (req, res) => {
  res.redirect('http://localhost:3000/dashboard'); // change this based on the frontend route
};

module.exports = {
  getCurrentUser,
  registerUser,
  loginUser,
  googleCallback,
};