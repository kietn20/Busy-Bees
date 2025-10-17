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

module.exports = {
  createEvent,
  getGroupEvents,
};