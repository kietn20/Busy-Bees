const mongoose = require('mongoose');
const Note = require('../models/Note.model');
const FlashcardSet = require('../models/FlashcardSet.model');
const { updateSnapshotsForItem, removeFavoritesForItem } = require('../utils/favorites.util');


// NOTE hooks
// pre-save: mark if title changed
Note.schema.pre('save', function (next) {
  try {
    this._favoritesSnapshotNeedsUpdate = this.isModified('title');
  } catch (e) {
    this._favoritesSnapshotNeedsUpdate = false;
  }
  next();
});

Note.schema.post('save', function (doc) {
  // doc is the saved document
  if (doc._favoritesSnapshotNeedsUpdate) {
    updateSnapshotsForItem(doc._id, doc.title);
  }
});

// findOneAndUpdate: attempt to detect title change from update object
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
    await updateSnapshotsForItem(itemId, newTitle);
  } catch (err) {
    console.error('Error in Note.findOneAndUpdate post hook', err);
  }
});

// findOneAndDelete: remove favorites
Note.schema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeFavoritesForItem(doc._id);
  }
});

// FlashcardSet hooks 
FlashcardSet.schema.pre('save', function (next) {
  try {
    this._favoritesSnapshotNeedsUpdate = this.isModified('setName');
  } catch (e) {
    this._favoritesSnapshotNeedsUpdate = false;
  }
  next();
});

FlashcardSet.schema.post('save', function (doc) {
  if (doc._favoritesSnapshotNeedsUpdate) {
    updateSnapshotsForItem(doc._id, doc.setName);
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
    await updateSnapshotsForItem(itemId, newName);
  } catch (err) {
    console.error('Error in FlashcardSet.findOneAndUpdate post hook', err);
  }
});

FlashcardSet.schema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeFavoritesForItem(doc._id);
  }
});
