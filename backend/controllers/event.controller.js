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

    // step 1: Find the event and populate its associated course group.
    const event = await Event.findById(eventId).populate('courseGroup');

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // step 2: Perform the authorization check using the populated group data
    const group = event.courseGroup;
    if (!group) {
        return res.status(404).json({ message: 'The group for this event no longer exists.' });
    }
    
    const isMember = group.members.some(member => member.equals(userId));
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this event\'s group.' });
    }

    // step 3: populate the creator's information for the response.
    await event.populate('createdBy', 'firstName lastName email');

    res.status(200).json(event);

  } catch (error) {
    console.error('Error fetching event by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Event not found.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};


// @desc    Update an event's details
// @route   PUT /api/events/:eventId
// @access  Private (Event Host)
const updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, description, startTime, endTime } = req.body;
    // the event is already fetched and attached by the isEventHost middleware
    const event = req.event; 

    // update fields if they were provided in the request body
    if (title) event.title = title;
    if (description) event.description = description;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;

    const updatedEvent = await event.save();

    res.status(200).json(updatedEvent);

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


module.exports = {
  createEvent,
  getGroupEvents,
  getEventById,
  updateEvent,
};