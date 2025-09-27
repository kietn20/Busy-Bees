require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");

require("./config/passport"); // Passport config
require("./config/db"); // MongoDB connection

// Route files
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");

const app = express();

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

app.get("/", (req, res) => res.send("Busybee Backend Running"));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
