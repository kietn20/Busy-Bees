// Purpose: Middleware to protect routes by verifying OAuth/session authentication only

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authorized, OAuth/session required' });
};

module.exports = { ensureAuthenticated };