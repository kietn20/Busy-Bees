// Purpose: Defines routes for all course group related actions

const express = require('express');
const { createCourseGroup, joinGroup, generateInvite, 
        getCourseGroupById, updateCourseGroup, deleteCourseGroup,
        leaveGroup } 
        = require('../controllers/coursegroup.controller'); 
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// all routes in this file will be protected, so we can use the middleware at the top level
router.use(protect);

//route to create a group
router.post("/", createCourseGroup);

// route to get group details by ID
router.get("/:id", getCourseGroupById);

// route to update a group's details
router.put("/:id", updateCourseGroup);

// Delete a course group
router.delete("/:groupId", deleteCourseGroup);

// route to join a group
router.post('/join', joinGroup);

// Leave group (requires authentication)
router.post("/:groupId/leave", leaveGroup);

// route to generate an invite code for a specific group
router.get('/:groupId/invite', generateInvite);


module.exports = router;
