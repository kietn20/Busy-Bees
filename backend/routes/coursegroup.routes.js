// Purpose: Defines routes for all course group related actions

const express = require('express');
const courseGroupController = require('../controllers/coursegroup.controller'); 
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// all routes in this file will be protected, so we can use the middleware at the top level
router.use(protect);

//route to create a group
router.post("/", courseGroupController.createCourseGroup);

// route to get group details by ID
router.get("/:id", courseGroupController.getCourseGroupById);

// route to update a group's details
router.put("/:id", courseGroupController.updateCourseGroup);

// Delete a course group
router.delete("/:groupId", courseGroupController.deleteCourseGroup);

// route to join a group
router.post('/join', courseGroupController.joinGroup);

// Leave group (requires authentication)
router.post("/:groupId/leave", courseGroupController.leaveGroup);

// route to generate an invite code for a specific group
router.get('/:groupId/invite', courseGroupController.generateInvite);


module.exports = router;
