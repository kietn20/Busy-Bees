const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User.model");

passport.serializeUser((user, done) => done(null, user.id)); // or user._id
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Store secrets in environment variables
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" // Use a secure callback URL
  },
  // OAuth callback: runs after Google authenticates the user
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check for existing user by Google ID or email
      let user = await User.findOne({
        $or: [
          { googleId: profile.id }, // Google unique user ID
          { email: profile.emails[0].value } // Primary email from Google profile
        ]
      });

      if (!user) {
        // If user doesn't exist, create a new user record
        // For OAuth users, do NOT require or store a password
        user = new User({
          googleId: profile.id,
          firstName: profile.name.givenName || "", // Use Google profile name
          lastName: profile.name.familyName || "",
          email: profile.emails[0].value, // Always use verified email
          // No password for OAuth users
        });
        await user.save(); // Save new user to MongoDB
      }

      // Pass user object to Passport for session management
      return done(null, user);
    } catch (err) {
      // On error, pass error to Passport
      return done(err, null);
    }
  }
));