const CourseGroup = require('../models/CourseGroup.model');

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

module.exports = {
  requireGroupOwner,
  requireGroupMember
};