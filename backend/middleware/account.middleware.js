const { body } = require("express-validator");

exports.registerValidation = [
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
];

exports.updateValidation = [
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