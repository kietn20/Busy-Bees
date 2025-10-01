const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require("express-session");
const passport = require("passport");

dotenv.config();

require("./config/passport"); // Passport config
require("./config/db"); // MongoDB connection

// Route files
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true
}));

app.use(express.json());

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    sameSite: "lax",
    secure: false }
}));

// initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/api/account", accountRoutes);
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
