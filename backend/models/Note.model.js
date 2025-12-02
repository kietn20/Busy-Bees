const mongoose = require("mongoose");
const { updateRecentlyViewedSnapshotsForItem, removeRecentlyViewedForItem } = require("../hooks/recentlyViewed.hooks");

const noteSchema = new mongoose.Schema(
    {
        userId: { // author of the note
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        groupId: { // ensure group-scoped visibility
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseGroup",
            required: true,
        },
        title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100,
        },
        content: {
            type: String,
            required: true, // change to false if you want to allow empty notes
            trim: true,
        },
        images: {
            type: [String], // Array of image URLs or base64 strings
            required: false,
        },
        collaborators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        lastEditedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: false,
        },
    },
    {timestamps: true} // automates createdAt and updatedAt fields
)


// NOTE hooks for recently viewed
noteSchema.post('save', function (doc) {
    if (doc._favoritesSnapshotNeedsUpdate) {
      updateRecentlyViewedSnapshotsForItem(doc._id, doc.title, "note");
    }
});

noteSchema.post('findOneAndUpdate', async function (res) {
  
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
    await updateRecentlyViewedSnapshotsForItem(itemId, newTitle, "note");
  } catch (err) {
    console.error('Error in Note.findOneAndUpdate post hook', err);
  }
});

noteSchema.post('findOneAndDelete', function (doc) {
  if (doc && doc._id) {
    removeRecentlyViewedForItem(doc._id);
  }
});


module.exports = mongoose.model("Note", noteSchema);