/**
 * Cleanup script to remove orphaned favorites
 * This script removes favorites that reference deleted notes or flashcard sets
 * 
 * Run with: node scripts/cleanupOrphanedFavorites.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const Note = require('../models/Note.model');
const FlashcardSet = require('../models/FlashcardSet.model');

dotenv.config();

async function cleanupOrphanedFavorites() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to check`);

        let totalOrphansRemoved = 0;

        for (const user of users) {
            let orphansRemovedForUser = 0;

            for (const course of user.registeredCourses) {
                if (!course.favorites || course.favorites.length === 0) continue;

                const favoritesToKeep = [];

                for (const favorite of course.favorites) {
                    let exists = false;

                    if (favorite.kind === 'note') {
                        // Check if note exists
                        const note = await Note.findById(favorite.itemId);
                        exists = !!note;
                    } else if (favorite.kind === 'flashcard') {
                        // Check if flashcard set exists
                        const flashcardSet = await FlashcardSet.findById(favorite.itemId);
                        exists = !!flashcardSet;
                    }

                    if (exists) {
                        favoritesToKeep.push(favorite);
                    } else {
                        orphansRemovedForUser++;
                        console.log(`  Removing orphaned ${favorite.kind}: ${favorite.titleSnapshot} (ID: ${favorite.itemId})`);
                    }
                }

                // Update the favorites array for this course
                course.favorites = favoritesToKeep;
            }

            if (orphansRemovedForUser > 0) {
                await user.save();
                console.log(`Cleaned up ${orphansRemovedForUser} orphaned favorites for user: ${user.email}`);
                totalOrphansRemoved += orphansRemovedForUser;
            }
        }

        console.log(`\n✅ Cleanup complete! Removed ${totalOrphansRemoved} orphaned favorites in total.`);

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the cleanup
cleanupOrphanedFavorites();
