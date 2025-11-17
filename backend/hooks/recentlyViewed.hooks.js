const mongoose = require('mongoose');
const User = require('../models/User.model');
const Note = require('../models/Note.model');
const FlashcardSet = require('../models/FlashcardSet.model');

// helper to update recently viewed
async function updateRecentlyViewedSnapshotsForItem(itemId, newTitle) {
  try {
    await User.updateMany(
      { 'registeredCourses.recentlyViewed.itemId': itemId },
      { $set: { 'registeredCourses.$[].recentlyViewed.$[r].titleSnapshot': newTitle } },
      { arrayFilters: [{ 'r.itemId': itemId }] }
    );
  } catch (err) {
    console.error('Error updating favorites snapshots for item', itemId, err);
  }
}

// helper to delete recently viewed
async function removeRecentlyViewedForItem(itemId) {
  try {
    await User.updateMany(
      { 'registeredCourses.recentlyViewed.itemId': itemId },
      { $pull: { 'registeredCourses.$[].recentlyViewed': { itemId: itemId } } }
    );
  } catch (err) {
    console.error('Error removing recently viewed for item', itemId, err);
  }
}


// NOTE hooks for recently viewed
Note.schema.post('save', function (doc) {
    if (doc._favoritesSnapshotNeedsUpdate) {
      updateRecentlyViewedSnapshotsForItem(doc._id, doc.title);
    }
});

Note.schema.post('findOneAndUpdate', async function (res) {
  try {
    const update = this.getUpdate && this.getUpdate();
    let newTitle;
    if (update) {
      if (update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'title')) {
        newTitle = update.$set.title;
      } else if (Object.prototype.hasOwnProperty.call(update, 'title')) {
        newTitle = update.title;
      }
    }
    if (!newTitle) return;
    // determine item id: try res._id else query
    const itemId = (res && res._id) ? res._id : (this.getQuery && this.getQuery()._id);
    if (!itemId) return;
    await updateRecentlyViewedSnapshotsForItem(itemId, newTitle);
  } catch (err) {
    console.error('Error in Note.findOneAndUpdate post hook', err);
  }
});

Note.schema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeRecentlyViewedForItem(doc._id);
  }
});

// FLASHCARD hooks for recently viewed
FlashcardSet.schema.post('save', function (doc) {
    if (doc._favoritesSnapshotNeedsUpdate) {
      updateRecentlyViewedSnapshotsForItem(doc._id, doc.setName);
    }
});

FlashcardSet.schema.post('findOneAndUpdate', async function (res) {
  try {
    const update = this.getUpdate && this.getUpdate();
    let newName;
    if (update) {
      if (update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'setName')) {
        newName = update.$set.setName;
      } else if (Object.prototype.hasOwnProperty.call(update, 'setName')) {
        newName = update.setName;
      }
    }
    if (!newName) return;
    const itemId = (res && res._id) ? res._id : (this.getQuery && this.getQuery()._id);
    if (!itemId) return;
    await updateRecentlyViewedSnapshotsForItem(itemId, newName);
  } catch (err) {
    console.error('Error in FlashcardSet.findOneAndUpdate post hook', err);
  }
});

FlashcardSet.schema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeRecentlyViewedForItem(doc._id);
  }
});

module.exports = {
    updateRecentlyViewedSnapshotsForItem,
    removeRecentlyViewedForItem
}