const express = require('express');
const { createEvent, getGroupEvents } = require('../controllers/event.controller');
const { createEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { isGroupMember, validateEvent } = require('../middleware/event.middleware');

// need to enable mergeParams to access :groupId from the parent router
const router = express.Router({ mergeParams: true });

// all routes here are protected and require group membership
router.use(protect, isGroupMember);

// route to get all events for a group
router.get('/', getGroupEvents);

// route to create a new event
router.post('/', validateEvent, createEvent);

module.exports = router;