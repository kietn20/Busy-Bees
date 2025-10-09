// Purpose: Defines routes for all course group related actions

const express = require('express');
const { generateInvite, joinGroup, createCourseGroup } = require('../controllers/coursegroup.controller'); 
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// all routes in this file will be protected, so we can use the middleware at the top level
router.use(protect);

//route to create a group
router.post("/", createCourseGroup);

// route to join a group
router.post('/join', joinGroup);

// route to generate an invite code for a specific group
router.get('/:groupId/invite', generateInvite);


module.exports = router;
