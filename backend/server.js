const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("./models/User.model");

dotenv.config();

require("./config/passport"); // Passport config
require("./config/db"); // MongoDB connection

// Route files
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const courseGroupRoutes = require("./routes/coursegroup.routes");
const { nestedEventRouter, eventRouter } = require("./routes/event.routes"); 
const { nestedNotesRouter, noteRouter } = require('./routes/notes.routes');
const noteCommentRoutes = require("./routes/notecomment.routes");
const flashcardRoutes = require('./routes/flashcard.routes');
require('./hooks/favorites.hooks'); // hooks for favorites snapshots
require('./hooks/recentlyViewed.hooks'); // hooks for recently viewed snapshots

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
app.use('/api/groups', courseGroupRoutes);
app.use('/api/groups/:groupId/flashcards', flashcardRoutes);
app.use('/api/groups/:groupId/events', nestedEventRouter); // nested routes for group events
app.use('/api/events', eventRouter); // top-level event routes
app.use('/api/groups/:groupId/notes', nestedNotesRouter);
app.use('/api/notes', noteRouter);
app.use("/api/groups/:groupId/notes/:noteId/comments", noteCommentRoutes);



// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Ensure indexes are in sync and drop legacy userId index if present
  (async () => {
    try {
      await User.syncIndexes();
      const indexes = await mongoose.connection.db
        .collection("users")
        .indexInformation({ full: true });
      const legacyUserIdIndex = indexes.find && indexes.find(i => i.name === "userId_1");
      if (legacyUserIdIndex) {
        await mongoose.connection.db.collection("users").dropIndex("userId_1");
        console.log("Dropped legacy index userId_1");
      }
    } catch (err) {
      console.error("Index sync error:", err);
    }
  })();
});
