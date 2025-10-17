const CourseGroup = require('../models/CourseGroup.model');
const { body, validationResult } = require('express-validator');

// middleware to check if the user is a member of the group
const isGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await CourseGroup.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    const isOwner = group.ownerId.equals(userId);
    const isMember = group.members.some(memberId => memberId.equals(userId));

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this group.' });
    }
    req.group = group; // attach the group to the request to avoid fetching it again in the controller
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during authorization.' });
  }
};

// validation rules for creating/updating an event
const validateEvent = [
  body('title', 'Title is required').not().isEmpty().trim().escape(),
  body('startTime', 'A valid start time is required').isISO8601().toDate(),
  body('endTime').optional().isISO8601().toDate(),
  body('description').optional().trim().escape(),
];

module.exports = {
  isGroupMember,
  validateEvent,
};