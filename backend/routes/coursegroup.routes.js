// Purpose: Defines routes for all course group related actions

const express = require('express');
const { createCourseGroup, joinGroup, generateInvite, 
        getCourseGroupById, updateCourseGroup, deleteCourseGroup,
        leaveGroup, getUserGroups, transferCourseGroupOwnership } 
        = require('../controllers/coursegroup.controller'); 
const { protect } = require('../middleware/auth.middleware');
const { requireGroupOwner, requireGroupMember } = require('../middleware/coursegroup.middleware');
const { allowJwtOrGoogle } = require('../middleware/auth.middleware');

const router = express.Router();

// all routes in this file will be protected, so we can use the middleware at the top level
// Use allowJwtOrGoogle to support both JWT and OAuth sessions
router.use(allowJwtOrGoogle);

// route to get all groups for the current user
router.get("/", getUserGroups);

// PUBLIC GROUP ROUTES (no authentication required)
//route to create a group
router.post("/", createCourseGroup);

// route to get group details by ID
router.get("/:id", getCourseGroupById);

// route to join a group
router.post('/join', joinGroup);

// OWNER_ONLY ROUTES
// route to update a group's details
router.put("/:id", requireGroupOwner, updateCourseGroup);

// Delete a course group
router.delete("/:groupId", requireGroupOwner, deleteCourseGroup);

// route to generate an invite code for a specific group
router.get('/:groupId/invite', requireGroupOwner, generateInvite);

// route to transfer group ownership
router.put("/:groupId/transfer-ownership", requireGroupOwner, transferCourseGroupOwnership);

// MEMBER-ONLY ROUTES
// Leave group (requires authentication)
router.post("/:groupId/leave", requireGroupMember, leaveGroup);


module.exports = router;
