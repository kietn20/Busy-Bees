// purpose of this file is to serve as the controller for course group related actions
const CourseGroup = require('../models/CourseGroup.model');
const Invite = require('../models/Invite.model');
const User = require('../models/User.model');
const { generateInviteCode } = require('../utils/invite.util');

// @desc    Create a new course group
// @route   POST /api/groups
// @access  Private
const createCourseGroup = async (req, res) => {
  try {
    const { groupName, description } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User must be logged in to create a group." });
    }

    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({ message: "Group name is required." });
    }

    const newGroup = await CourseGroup.create({
      groupName,
      description,
      ownerId: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      message: "Course group created successfully.",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating course group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a course group by ID
// @route   GET /api/groups/:id
// @access  Private
const getCourseGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await CourseGroup.findById(id).populate("members", "firstName lastName email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({
      message: "Group details fetched successfully",
      group,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Generate or retrieve an invite code for a group
// @route   GET /api/groups/:groupId/invite
// @access  Private (Group Owner)
const generateInvite = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id; // from our 'protect' middleware

    // 1. find the course group
    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Course group not found.' });
    }

    // 2. authorize: check if the user is the group owner
    if (!group.ownerId.equals(userId)) {
      return res.status(403).json({ message: 'Forbidden: You are not the owner of this group.' });
    }

    // 3. check for an existing, valid invite
    let invite = await Invite.findOne({
      courseGroup: groupId,
      expiresAt: { $gt: new Date() } // check if the expiration date is in the future
    });

    // 4. if no valid invite exists, create one
    if (!invite) {
      const code = await generateInviteCode();
      
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7); // Set expiration to 7 days from now

      invite = new Invite({
        code,
        courseGroup: groupId,
        createdBy: userId,
        expiresAt: expiration,
      });
      await invite.save();
    }

    // 5. return the invite code
    res.status(200).json({
      inviteCode: invite.code,
      expiresAt: invite.expiresAt,
    });

  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Join a course group using an invite code
// @route   POST /api/groups/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    // 1. validate input
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required.' });
    }

    // 2. validate the invite code
    const invite = await Invite.findOne({
      code: inviteCode,
      expiresAt: { $gt: new Date() } // ensure it's not expired
    });

    if (!invite) {
      return res.status(400).json({ message: 'Invalid or expired invite code.' });
    }

    // 3. find the associated group
    const group = await CourseGroup.findById(invite.courseGroup);
    if (!group) {
      // clean up the invalid invite
      await Invite.findByIdAndDelete(invite._id);
      return res.status(404).json({ message: 'The group for this invite no longer exists.' });
    }

    // 4. check if user is already the owner or a member
    if (group.ownerId.equals(userId)) {
      return res.status(409).json({ message: 'You are the owner of this group.' });
    }
    
    // .some() checks if at least one element in the array passes the test
    const isAlreadyMember = group.members.some(memberId => memberId.equals(userId));
    if (isAlreadyMember) {
      return res.status(409).json({ message: 'You are already a member of this group.' });
    }

    // 5. add user to the group's members list
    group.members.push(userId);
    await group.save();



    // 6. add the group to the user's registeredCourses (NOT IMPLEMENTED YET BECAUSE USER MODEL DOESN'T HAVE IT)
    // const courseInfo = { courseId: group._id, courseName: group.groupName };
    // await User.findByIdAndUpdate(userId, { $addToSet: { registeredCourses: courseInfo } });



    res.status(200).json({
      message: 'Successfully joined the group.',
      group: {
        id: group._id,
        groupName: group.groupName,
      }
    });

  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Update course group details (owner only)
// @route   PUT /api/groups/:id
// @access  Private
const updateCourseGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, description } = req.body;
    const userId = req.user._id;

    // find group
    const group = await CourseGroup.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // authorize owner
    if (!group.ownerId.equals(userId)) {
      return res.status(403).json({ message: "Only the owner can edit this group" });
    }

    // update values (only if provided)
    if (groupName) group.groupName = groupName.trim();
    if (description) group.description = description.trim();

    await group.save();

    res.status(200).json({
      message: "Course group updated successfully",
      group,
    });
  } catch (error) {
    console.error("Error updating course group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a course group (owner only)
// @route   DELETE /api/groups/:groupId
// @access  Private
const deleteCourseGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Ensure user is logged in
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    // Find the group
    const group = await CourseGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Ensure only the owner can delete
    if (!group.ownerId.equals(req.user._id)) {
      return res.status(403).json({ message: "You are not authorized to delete this group." });
    }

    // Delete all related invites first
    await Invite.deleteMany({ courseGroup: groupId });

    // Delete the group
    await CourseGroup.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Course group and related invites deleted successfully." });
  } catch (error) {
    console.error("Error deleting course group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// gets all course groups
exports.getCourseGroups = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroups" });
};

// join group via invite
exports.addUserToCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: addUserToCourseGroup" });
};

// leave group (non-owners only)
exports.removeUserFromCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: removeUserFromCourseGroup" });
};

// transfers ownership of a course group to another user
exports.transferCourseGroupOwnership = (req, res) => {
  res.status(200).json({ message: "Stub: transferCourseGroupOwnership" });
};

// lists all members of a course group
exports.getGroupMembers = (req, res) => {
  res.status(200).json({ message: "Stub: getGroupMembers" });
};

// fetch group invite link
exports.getGroupInviteLink = (req, res) => {
  res.status(200).json({ message: "Stub: getGroupInviteLink" });
};

// validate invite before joining
exports.validateInviteCode = (req, res) => {
  res.status(200).json({ message: "Stub: validateInviteCode" });
};


module.exports = {
  generateInvite,
  joinGroup,
  createCourseGroup,
  getCourseGroupById,
  updateCourseGroup,
  deleteCourseGroup
};
