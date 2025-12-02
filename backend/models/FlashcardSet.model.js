const mongoose = require("mongoose");
const { updateRecentlyViewedSnapshotsForItem, removeRecentlyViewedForItem } = require("../hooks/recentlyViewed.hooks");

const flashcardSetSchema = new mongoose.Schema(
    {
        userId: { // creator of the flashcard set
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseGroupId: { // associated course group
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseGroup",
            required: true,
        },
        setName: {
            type: String,
            required: true,
            maxLength: 30
        },
        description: {
            type: String,
            required: false,
            maxLength: 150
        },
        flashcards: [ // get length of this array to know number of flashcards in the set
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Flashcard",
            },
        ],
    },
    { timestamps: true } // automatically adds createdAt and updatedAt fields
)

// FLASHCARD hooks for recently viewed
flashcardSetSchema.post('save', function (doc) {
    if (doc._favoritesSnapshotNeedsUpdate) {
      updateRecentlyViewedSnapshotsForItem(doc._id, doc.setName, "flashcardSet");
    }
});

flashcardSetSchema.post('findOneAndUpdate', async function (res) {
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
    await updateRecentlyViewedSnapshotsForItem(itemId, newName, "flashcardSet");
  } catch (err) {
    console.error('Error in FlashcardSet.findOneAndUpdate post hook', err);
  }
});

flashcardSetSchema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeRecentlyViewedForItem(doc._id);
  }
});

module.exports = mongoose.model("FlashcardSet", flashcardSetSchema);