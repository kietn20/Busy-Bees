const CourseGroup = require('../models/CourseGroup.model');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event.model');

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

// middleware to check if the user can modify an event (is host OR group owner)
const canModifyEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // populate the group owner's ID when fetching the event
    const event = await Event.findById(eventId).populate({
        path: 'courseGroup',
        select: 'ownerId'
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const isEventHost = event.createdBy.equals(userId);
    const isGroupOwner = event.courseGroup.ownerId.equals(userId);

    // if the user is neither the host nor the group owner, deny access
    if (!isEventHost && !isGroupOwner) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to modify this event.' });
    }

    // attach the event to the request to avoid fetching it again
    req.event = event; 
    next();
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found.' });
    }
    res.status(500).json({ message: 'Server error during event permission check.' });
  }
};
// validation rules for creating/updating an event
const validateEvent = [
  body('title', 'Title is required').not().isEmpty().trim().escape(),
  body('startTime', 'A valid start time is required').isISO8601().toDate(),
  body('endTime').optional({ checkFalsy: true }).isISO8601().toDate(), // allow null/empty string
  body('description').optional().trim().escape(),
];

module.exports = {
  isGroupMember,
  validateEvent,
  canModifyEvent,
};