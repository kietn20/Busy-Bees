const Event = require('../models/Event.model');
const { validationResult } = require('express-validator');

// @desc    Create a new event in a group
// @route   POST /api/groups/:groupId/events
// @access  Private (Group Members)
const createEvent = async (req, res) => {
  // check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, startTime, endTime } = req.body;
    const { groupId } = req.params;
    const userId = req.user._id;

    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime: endTime || null,
      courseGroup: groupId,
      createdBy: userId,
    });

    await newEvent.save();

    res.status(201).json(newEvent);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// @desc    Get all events for a specific group
// @route   GET /api/groups/:groupId/events
// @access  Private (Group Members)
const getGroupEvents = async (req, res) => {
  try {
    const { groupId } = req.params;

    const events = await Event.find({ courseGroup: groupId })
      .sort({ startTime: 'asc' }) // sort by start time ascending
      .populate('createdBy', 'firstName lastName email'); // populate creator details

    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching group events:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// @desc    Get a single event by its ID
// @route   GET /api/events/:eventId
// @access  Private (Group Members of the event's group)
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'firstName lastName email')
      .populate('courseGroup', 'groupName ownerId members'); // get group details

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // check if the requesting user is a member of the event's group
    const group = event.courseGroup;
    const isMember = group.members.some(member => member.userId.equals(userId));
    
    if (!isMember) {
        return res.status(403).json({ message: 'Forbidden: You are not a member of this event\'s group.' });
    }

    // to avoid sending the whole members array to the client, we can create a new object
    const eventResponse = event.toObject();
    eventResponse.courseGroup = {
        _id: group._id,
        groupName: group.groupName
    };


    res.status(200).json(eventResponse);

  } catch (error) {
    console.error('Error fetching event by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createEvent,
  getGroupEvents,
  getEventById,
};