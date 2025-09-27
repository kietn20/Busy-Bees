const jwt = require('jsonwebtoken');

/**
 * Generates a JWT for a given user ID.
 * @param {string} userId The unique identifier of the user.
 * @returns {string} The generated JSON Web Token.
 */
const generateToken = (userId) => {
  const payload = {
    id: userId,
  };

  // sign the token with secret key and set an expiration date
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};


/**
 * Verifies a JWT and returns its decoded payload if valid.
 * @param {string} token The JSON Web Token to verify.
 * @returns {object | null} The decoded payload of the token, or null if verification fails.
 */
const verifyToken = (token) => {
  try {
    // jwt.verify will throw an error if the token is invalid (ex: bad signature, expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};