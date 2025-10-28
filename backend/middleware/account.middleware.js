const { body } = require("express-validator");

const registerValidation = [
  //body("userId").notEmpty().withMessage("User ID is required"),
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
];

const updateValidation = [
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
];

const preventOAuthEmailPasswordChange = (req, res, next) => {
  const { email, password } = req.body;
  
  // If user is OAuth user (has googleId)
  if (req.user.googleId) {
    // Check if they're trying to change email
    if (email && email !== req.user.email) {
      return res.status(403).json({ 
        message: "Email cannot be changed for Google accounts" 
      });
    }
    
    // Check if they're trying to set a password
    if (password) {
      return res.status(403).json({ 
        message: "Password cannot be set for Google accounts" 
      });
    }
  }
  
  next();
};

module.exports = {
  registerValidation,
  updateValidation,
  preventOAuthEmailPasswordChange
}