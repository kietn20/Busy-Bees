
const User = require('../models/User.model');


// helper to update recently viewed
async function updateRecentlyViewedSnapshotsForItem(itemId, newTitle, kind = "note") {
    
  try {
    const users = await User.find({ 'registeredCourses.recentlyViewed.itemId': itemId });
    for (const user of users) {
      let updated = false;
      for (const course of user.registeredCourses) {
        for (const rv of course.recentlyViewed) {
          if (
            String(rv.itemId) === String(itemId) &&
            rv.kind === kind
          ) {
            rv.titleSnapshot = newTitle;
            updated = true;
            console.log(
              `Updated recently viewed for user ${user._id}, course ${course.courseId}, item ${itemId}, kind ${kind}, newTitle: ${newTitle}`
            );
          }
        }
      }
      if (updated) {await user.save();
      console.log(`Saved user ${user._id} with updated recently viewed snapshot`);}
    }
  } catch (err) {
    console.error('Error updating recently viewed snapshots for item', itemId, err);
  }
}

// helper to delete recently viewed
async function removeRecentlyViewedForItem(itemId) {
  try {
    await User.updateMany(
      { 'registeredCourses.recentlyViewed.itemId': itemId },
      {
        $pull: {
          'registeredCourses.$[rc].recentlyViewed': { itemId: itemId }
        }
      },
      {
        arrayFilters: [
          { 'rc.recentlyViewed.itemId': itemId }
        ]
      }
    );
  } catch (err) {
    console.error('Error removing recently viewed for item', itemId, err);
  }
}


module.exports = {
    updateRecentlyViewedSnapshotsForItem,
    removeRecentlyViewedForItem
}