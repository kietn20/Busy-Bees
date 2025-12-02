const CourseGroup = require('../models/CourseGroup.model');
const User = require('../models/User.model');


// Middleware to check if user is the owner of a group
const requireGroupOwner = async (req, res, next) => {
  try {
    const groupId = req.params.id || req.params.groupId;
    const userId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // --- FIX: Check the 'ownerId' field directly ---
    if (!group.ownerId.equals(userId)) {
      return res.status(403).json({ message: "Access denied: Only the group owner can perform this action" });
    }

    req.group = group;
    next();

  } catch (error) {
    console.error("Error in requireGroupOwner middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Middleware to check if user is a member (owner or regular member) of a group
const requireGroupMember = async (req, res, next) => {
  try {
    const groupId = req.params.id || req.params.groupId;
    const userId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const memberRecord = group.members.find(member => member.userId.equals(userId));

    if (!memberRecord) {
      return res.status(403).json({ message: "Access denied: You must be a member of this group" });
    }

    req.group = group;
    req.memberRecord = memberRecord; // Attach member record for further use if needed
    next();

  } catch (error) {
    console.error("Error in requireGroupMember middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Middleware to validate courseId from query (for GET /favorites and /recently-viewed)
function requireCourseQuery(req, res, next) {
  const { courseId, kind } = req.query || {};
  if (!courseId) return res.status(400).json({ message: 'courseId query param is required' });
  if (kind && !['note', 'flashcardSet'].includes(kind)) {
    return res.status(400).json({ message: 'kind must be "note" or "flashcardSet"' });
  }
  req.courseQuery = { courseId, kind };
  next();
}

// Middleware to load the user's registered course entry and user doc
async function ensureRegisteredCourse(req, res, next) {
  try {
    const courseId =
      req.courseAction?.courseId ||
      req.courseQuery?.courseId ||
      req.body?.courseId ||
      req.query?.courseId;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reg = (user.registeredCourses || []).find(rc => String(rc.courseId) === String(courseId));
    if (!reg) return res.status(403).json({ message: 'User not registered in course' });

    // attach for controllers to use
    req.userDoc = user;
    req.registeredCourse = reg;
    next();
  } catch (err) {
    console.error('ensureRegisteredCourse error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  requireGroupOwner,
  requireGroupMember,
  requireCourseQuery,
  ensureRegisteredCourse
};