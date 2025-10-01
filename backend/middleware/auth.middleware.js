// Purpose: Middleware to protect routes by verifying JWT.

const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  let token;

  // 1. check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. extract the token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 3. verify the token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }

      // 4. find the user by ID from the token's payload and attach the user object to the request, excluding the password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // 5. proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Checks if user is authenticated via either JWT or Google OAuth/session
const allowJwtOrGoogle = async (req, res, next) => {
  // Try OAuth first
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // Try JWT
  try {
    await protect(req, res, (err) => {
        if (err) throw err;
        next();
    });
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = { 
    protect,
    allowJwtOrGoogle
};