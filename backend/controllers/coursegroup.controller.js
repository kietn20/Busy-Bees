// purpose of this file is to serve as the controller for course group related actions
const CourseGroup = require('../models/CourseGroup.model');
const Invite = require('../models/Invite.model');
const User = require('../models/User.model');
const Note = require('../models/Note.model');
const Event = require('../models/Event.model');
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

    // 1. Create the course group
    const newGroup = await CourseGroup.create({
      groupName,
      description,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: "owner" }],
    });

    // 2. Add the group to owner's registeredCourses
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        registeredCourses: {
          courseId: newGroup._id,
          courseName: newGroup.groupName,
        },
      },
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

    // returns the group with populated member and owner details
    const group = await CourseGroup.findById(id)
    .populate("members.userId", "firstName lastName email")
    .populate("ownerId", "firstName lastName email");

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
    const group = req.group; // from our 'requireGroupOwner' middleware
  

    // 1. check for an existing, valid invite
    let invite = await Invite.findOne({
      courseGroup: groupId,
      expiresAt: { $gt: new Date() } // check if the expiration date is in the future
    });

    // 2. if no valid invite exists, create one
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

    // 3. return the invite code
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
    
    // .some() checks if at least one element in the array passes the test
    const isAlreadyMember = group.members.some(memberId => memberId.userId.equals(userId));
    if (isAlreadyMember) {
      return res.status(409).json({ message: 'You are already a member of this group.' });
    }

    // 5. add user to the group's members list
    group.members.push({ userId, role: "member" });
    await group.save();



    // 6. add the group to the user's registeredCourses (NOT IMPLEMENTED YET BECAUSE USER MODEL DOESN'T HAVE IT)
    const courseInfo = { courseId: group._id, courseName: group.groupName };
    await User.findByIdAndUpdate(userId, { $addToSet: { registeredCourses: courseInfo } });



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
    const { groupName, description } = req.body;
    const group = req.group; // from our 'requireGroupOwner' middleware

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
    const group = req.group; // from requireGroupOwner

    // 1) Delete all invites for this group
    await Invite.deleteMany({ courseGroup: group._id });

    // 2) Delete all notes for this group
    await Note.deleteMany({ groupId: group._id });

    // 3) Remove this group from every user's registeredCourses
    await User.updateMany(
      { "registeredCourses.courseId": group._id },
      { $pull: { registeredCourses: { courseId: group._id } } }
    );

    // 4) Delete all events related to this group
    await Event.deleteMany({ groupId: group._id });

    // 5) Delete the group itself
    await CourseGroup.findByIdAndDelete(group._id);

    res.status(200).json({ message: "Course group and related data deleted successfully." });
  } catch (error) {
    console.error("Error deleting course group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Leave a course group
// @route   POST /api/groups/:groupId/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = req.group; // from requireGroup middleware
    const memberRecord = req.memberRecord; // from requireGroup middleware

    // Prevent owner from leaving
    if (memberRecord.role === "owner") {
      return res.status(403).json({
        message: "Group owners cannot leave their own group. Transfer ownership first.",
      });
    }

    // Check if they're already not a member
    const isMember = group.members.some((member) =>
      member.userId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(409).json({
        message: "You are not a member of this group.",
      });
    }

    // Remove from group's member list
    group.members = group.members.filter(
      (member) => !member.userId.equals(userId)
    );
    await group.save();

    // Remove from user's registeredCourses
    await User.findByIdAndUpdate(userId, {
      $pull: { registeredCourses: { courseId: groupId } },
    });

    res.status(200).json({
      message: "Successfully left the group.",
      groupId: group._id,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all groups where the user is a member
// @route   GET /api/groups
// @access  Private
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all groups where the user is a member
    const groups = await CourseGroup.find({
      members: userId
    }).populate('ownerId', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      message: 'Groups fetched successfully',
      groups
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// transfers ownership of a course group to another user
const transferCourseGroupOwnership = (req, res) => {
  res.status(200).json({ message: "Stub: transferCourseGroupOwnership" });
};


// gets all course groups
// not really necessary we have getUserGroups
const getCourseGroups = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroups" });
};

// join group via invite
// we already have joinGroup
const addUserToCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: addUserToCourseGroup" });
};

// leave group (non-owners only)
// leaveGroup function along with middleware handles this already
const removeUserFromCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: removeUserFromCourseGroup" });
};


// lists all members of a course group
// we do not need this for displaying members
// but we could use it later if we need only members w/o group data
const getGroupMembers = (req, res) => {
  res.status(200).json({ message: "Stub: getGroupMembers" });
};

// fetch group invite link
// we dont need this we already have generateInvite
const getGroupInviteLink = (req, res) => {
  res.status(200).json({ message: "Stub: getGroupInviteLink" });
};

// validate invite before joining
// we dont need this, join group already validates it
const validateInviteCode = (req, res) => {
  res.status(200).json({ message: "Stub: validateInviteCode" });
};

module.exports = {
  generateInvite,
  joinGroup,
  createCourseGroup,
  getCourseGroupById,
  updateCourseGroup,
  deleteCourseGroup,
  leaveGroup,
  getUserGroups
};
