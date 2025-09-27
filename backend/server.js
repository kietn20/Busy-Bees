const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require("express-session");
const passport = require("passport");

require("./config/passport"); // Passport config
require("./config/db"); // MongoDB connection

// Route files
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());

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


// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






