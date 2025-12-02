// purpose of this file is to serve as the controller for course group related actions
const CourseGroup = require("../models/CourseGroup.model");
const Invite = require("../models/Invite.model");
const User = require("../models/User.model");
const Note = require("../models/Note.model");
const NoteComment = require("../models/NoteComment.model");
const FlashcardSet = require("../models/FlashcardSet.model");
const Flashcard = require("../models/Flashcard.model");
const Event = require("../models/Event.model");
const { generateInviteCode } = require("../utils/invite.util");
const { omitUndefined } = require("mongoose");
const mongoose = require("mongoose");

const MAX_GROUP_NAME_LENGTH = 40;

// @desc    Create a new course group
// @route   POST /api/groups
// @access  Private
const createCourseGroup = async (req, res) => {
  try {
    const { groupName, description } = req.body;

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "User must be logged in to create a group." });
    }

    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({ message: "Group name is required." });
    }

    if (groupName.length > MAX_GROUP_NAME_LENGTH) {
      return res
        .status(400)
        .json({
          message: `Group name must be ${MAX_GROUP_NAME_LENGTH} characters or fewer.`,
        });
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

    // Filter out members with deleted accounts
    const validMembers = group.members.filter((m) => m.userId != null);

    if (validMembers.length !== group.members.length) {
      console.log(
        ` Cleaned ${
          group.members.length - validMembers.length
        } orphaned members from group ${id}`
      );
      group.members = validMembers;
      await group.save();
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
      expiresAt: { $gt: new Date() }, // check if the expiration date is in the future
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
    console.error("Error generating invite code:", error);
    res.status(500).json({ message: "Internal server error." });
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
      return res.status(400).json({ message: "Invite code is required." });
    }

    // 2. validate the invite code
    const invite = await Invite.findOne({
      code: inviteCode,
      expiresAt: { $gt: new Date() }, // ensure it's not expired
    });

    if (!invite) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invite code." });
    }

    // 3. find the associated group
    const group = await CourseGroup.findById(invite.courseGroup);
    if (!group) {
      // clean up the invalid invite
      await Invite.findByIdAndDelete(invite._id);
      return res
        .status(404)
        .json({ message: "The group for this invite no longer exists." });
    }

    // 4. check if user is already the owner or a member

    // .some() checks if at least one element in the array passes the test
    const isAlreadyMember = group.members.some((memberId) =>
      memberId.userId.equals(userId)
    );
    if (isAlreadyMember) {
      return res
        .status(409)
        .json({ message: "You are already a member of this group." });
    }

    // 5. add user to the group's members list
    group.members.push({ userId, role: "member" });
    await group.save();

    // 6. add the group to the user's registeredCourses (NOT IMPLEMENTED YET BECAUSE USER MODEL DOESN'T HAVE IT)
    const courseInfo = { courseId: group._id, courseName: group.groupName };
    await User.findByIdAndUpdate(userId, {
      $addToSet: { registeredCourses: courseInfo },
    });

    res.status(200).json({
      message: "Successfully joined the group.",
      group: {
        id: group._id,
        groupName: group.groupName,
      },
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc    Update course group details (owner only)
// @route   PUT /api/groups/:id
// @access  Private
const updateCourseGroup = async (req, res) => {
  try {
    const { groupName, description } = req.body;
    const group = req.group; // from our 'requireGroupOwner' middleware

    if (groupName && groupName.length > MAX_GROUP_NAME_LENGTH) {
      return res
        .status(400)
        .json({
          message: `Group name must be ${MAX_GROUP_NAME_LENGTH} characters or fewer.`,
        });
    }

    // update values (only if provided)
    if (groupName) group.groupName = groupName.trim();
    if (description !== undefined) group.description = description.trim();

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
  const session = await mongoose.startSession();

  try {
    const group = req.group; // from requireGroupOwner middleware

    await session.withTransaction(async () => {
      // 1) Delete invites
      if (Invite) {
        await Invite.deleteMany({ courseGroup: group._id }, { session });
      }

      // 2) Delete notes and related comments
      if (Note) {
        const noteIds = await Note.find(
          { groupId: group._id },
          { _id: 1 },
          { session }
        ).then((notes) => notes.map((n) => n._id));

        if (noteIds.length > 0) {
          if (NoteComment) {
            await NoteComment.deleteMany(
              { noteId: { $in: noteIds } },
              { session }
            );
          }
          await Note.deleteMany({ _id: { $in: noteIds } }, { session });
        }
      }

      // 3) Delete flashcard sets and related flashcards
      if (FlashcardSet) {
        const sets = await FlashcardSet.find(
          { courseGroupId: group._id },
          { _id: 1, flashcards: 1 },
          { session }
        ).then((sets) => sets.map((s) => s._id));

        const setIds = sets.map((s) => s._id);
        const flashcardIds = sets.flatMap((s) => s.flashcards);

        if (flashcardIds.length > 0 && Flashcard) {
          await Flashcard.deleteMany(
            { _id: { $in: flashcardIds } },
            { session }
          );
        }

        if (setIds.length > 0) {
          await FlashcardSet.deleteMany({ _id: { $in: setIds } }, { session });
        }
      }

      // 4) Delete events related to this group
      if (Event) {
        await Event.deleteMany({ courseGroup: group._id }, { session });
      }

      // 5) Remove group reference from every user's registeredCourses
      await User.updateMany(
        { "registeredCourses.courseId": String(group._id) },
        { $pull: { registeredCourses: { courseId: String(group._id) } } },
        { session }
      );

      // 6) Delete the group itself
      await CourseGroup.findByIdAndDelete(group._id, { session });
    });

    res.status(200).json({
      message: "Course group and all related data deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting course group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Leave a course group
// @route   POST /api/groups/:groupId/leave
// @access  Private
const leaveGroup = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = req.group; // from requireGroup middleware
    const memberRecord = req.memberRecord; // from requireGroup middleware

    // 1) Prevent owner from leaving
    if (memberRecord?.role === "owner") {
      return res.status(403).json({
        message:
          "Group owners cannot leave their own group. Transfer ownership first.",
      });
    }

    // 2) Ensure user is currently a member
    const isMember = group.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember) {
      return res
        .status(409)
        .json({ message: "You are not a member of this group." });
    }

    await session.withTransaction(async () => {
      // 3) Remove user from group's members
      group.members = group.members.filter((m) => !m.userId.equals(userId));
      await group.save({ session });

      // 4) Remove group from user's registeredCourses
      await User.findByIdAndUpdate(
        userId,
        { $pull: { registeredCourses: { courseId: String(groupId) } } },
        { session }
      );

      // 5) Delete all notes by the user in this group + their comments
      if (Note) {
        const noteIds = await Note.find(
          { groupId: groupId, userId: userId },
          { _id: 1 },
          { session }
        ).then((rows) => rows.map((n) => n._id));

        if (noteIds.length > 0) {
          if (NoteComment) {
            await NoteComment.deleteMany(
              { noteId: { $in: noteIds } },
              { session }
            );
          }
          await Note.deleteMany({ _id: { $in: noteIds } }, { session });
        }
      }

      // 6) Delete all flashcard sets by the user in this group + their flashcards
      if (FlashcardSet) {
        const sets = await FlashcardSet.find(
          { courseGroupId: groupId, userId: userId },
          { _id: 1, flashcards: 1 },
          { session }
        );

        const setIds = sets.map((s) => s._id);
        const flashcardIds = sets.flatMap((s) => s.flashcards);

        if (flashcardIds.length > 0 && Flashcard) {
          await Flashcard.deleteMany(
            { _id: { $in: flashcardIds } },
            { session }
          );
        }

        if (setIds.length > 0) {
          await FlashcardSet.deleteMany({ _id: { $in: setIds } }, { session });
        }
      }

      // 7) Delete all events created by this user in the group
      if (Event) {
        await Event.deleteMany(
          { courseGroup: groupId, createdBy: userId },
          { session }
        );

        // And remove the user from attendees of any remaining events in the group
        await Event.updateMany(
          { courseGroup: groupId },
          { $pull: { attendees: userId } },
          { session }
        );
      }
    });

    res.status(200).json({
      message: "Successfully left the group and removed your related content.",
      groupId: group._id,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Transfer ownership of a course group to another member
// @route   PUT /api/groups/:groupId/transfer-ownership
// @access  Private (Owner only)
const transferCourseGroupOwnership = async (req, res) => {
  try {
    const { groupId } = req.params; // mongoDB id of the group
    const { newOwnerId } = req.body; // mongoDB id of the new owner
    const currentUserId = req.user._id; // from our 'allowJwtOrGoogle' middleware
    const group = req.group; // from our 'requireGroupOwner' middleware

    // validate input
    if (!newOwnerId) {
      return res.status(400).json({ message: "New owner ID is required." });
    }

    // check if new owner is different from current owner
    if (group.ownerId.equals(newOwnerId)) {
      return res
        .status(400)
        .json({ message: "New owner must be different from current owner." });
    }

    // Filter out members with null userId first (deleted accounts)
    group.members = group.members.filter((m) => m.userId != null);

    // check if new owner is member of the group and find the owner
    const newOwnerMember = group.members.find((member) =>
      member.userId.equals(newOwnerId)
    );
    const currentOwnerMember = group.members.find((member) =>
      member.userId.equals(currentUserId)
    );

    if (!newOwnerMember) {
      return res
        .status(404)
        .json({
          message: "The specified new owner is not a member of the group.",
        });
    }

    if (!currentOwnerMember) {
      return res
        .status(500)
        .json({ message: "Current owner not found in members list." });
    }

    // update roles in members array
    currentOwnerMember.role = "member";
    newOwnerMember.role = "owner";

    // update ownerId property as well to keep in sync with members array
    group.ownerId = newOwnerId;

    // save changes
    await group.save();

    // populate updated group for response
    const updatedGroup = await CourseGroup.findById(groupId)
      .populate("members.userId", "firstName lastName email")
      .populate("ownerId", "firstName lastName email");

    // Filter again after populate (in case any became null during populate)
    if (updatedGroup) {
      updatedGroup.members = updatedGroup.members.filter(
        (m) => m.userId != null
      );
    }

    res.status(200).json({
      message: "Ownership transferred successfully.",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Error transferring ownership:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all groups where the user is a member
// @route   GET /api/groups
// @access  Private
const getUserGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("registeredCourses");

    if (!user || !user.registeredCourses) {
      return res.status(404).json({ message: "No registered groups found" });
    }

    // Get the latest group info from CourseGroup collection
    const groupIds = user.registeredCourses.map((rc) => rc.courseId);
    const groups = await CourseGroup.find({ _id: { $in: groupIds } }).select(
      "_id groupName description"
    );

    return res.status(200).json({
      message: "User's registered course groups retrieved successfully",
      groups,
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// USE THIS IMPLEMENTATION IF WE WANT TO DISPLAY GROUP DETAILS IN HOME PAGE
// @desc    Get all groups where the user is a member
// @route   GET /api/groups
// @access  Private
// const getUserGroups = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Find all groups where the user is a member
//     const groups = await CourseGroup.find({
//       "members.userId": userId
//     })
//       .populate('ownerId', 'firstName lastName email')
//       .populate('members.userId', 'firstName lastName email')
//       .sort({ createdAt: -1 }); // sort by newest first

//     // Filter out null members from each group
//     const cleanedGroups = groups.map(group => {
//       const validMembers = group.members.filter(m => m.userId != null);

//       if (validMembers.length !== group.members.length) {
//         console.log(`⚠️ Cleaned ${group.members.length - validMembers.length} orphaned members from group ${group._id}`);
//         group.members = validMembers;
//         group.save(); // Save asynchronously (fire and forget)
//       }

//       return group;
//     });
//     res.status(200).json({
//       message: 'Groups fetched successfully',
//       groups: cleanedGroups
//     });
//   } catch (error) {
//     console.error('Error fetching user groups:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

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
  getUserGroups,
  transferCourseGroupOwnership,
};
