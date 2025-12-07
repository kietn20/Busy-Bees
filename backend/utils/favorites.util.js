const User = require('../models/User.model');

// Helper to update snapshots for a given itemId and newTitle
async function updateSnapshotsForItem(itemId, newTitle) {
    try {
        await User.updateMany(
            { 'registeredCourses.favorites.itemId': itemId },
            { $set: { 'registeredCourses.$[].favorites.$[f].titleSnapshot': newTitle } },
            { arrayFilters: [{ 'f.itemId': itemId }] }
        );
    } catch (err) {
        console.error('Error updating favorites snapshots for item', itemId, err);
    }
}

// Helper to remove favorites referencing an itemId
async function removeFavoritesForItem(itemId) {
    try {
        await User.updateMany(
            { 'registeredCourses.favorites.itemId': itemId },
            { $pull: { 'registeredCourses.$[].favorites': { itemId: itemId } } }
        );
    } catch (err) {
        console.error('Error removing favorites for item', itemId, err);
    }
}

module.exports = {
    updateSnapshotsForItem,
    removeFavoritesForItem,
};
