const express = require('express');
const { createEvent, getGroupEvents, getEventById, updateEvent } = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireGroupMember } = require('../middleware/coursegroup.middleware');
const { validateEvent, isEventHost} = require('../middleware/event.middleware');

// router for routes nested under /api/groups/:groupId
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.use(protect, requireGroupMember);
nestedRouter.get('/', getGroupEvents);
nestedRouter.post('/', validateEvent, createEvent);

// router for top-level routes like /api/events
const topLevelRouter = express.Router();
topLevelRouter.use(protect); // All event routes should be protected
topLevelRouter.get('/:eventId', getEventById);
topLevelRouter.put('/:eventId', isEventHost, validateEvent, updateEvent); // only event host can update the event

// export both routers
module.exports = {
  nestedEventRouter: nestedRouter,
  eventRouter: topLevelRouter,
};