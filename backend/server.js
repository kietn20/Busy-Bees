require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");

require("./config/passport"); // Passport config
require("./config/db"); // MongoDB connection

const authRoutes = require("./routes/auth");

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
app.use("/auth", authRoutes);

app.get("/", (req, res) => res.send("Busybee Backend Running"));

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
