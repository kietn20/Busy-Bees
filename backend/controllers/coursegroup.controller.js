// purpose of this file is to serve as the controller for course group related actions
const CourseGroup = require('../models/CourseGroup.model');
const Invite = require('../models/Invite.model');
const { generateInviteCode } = require('../utils/invite.util');

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

module.exports = {
  generateInvite,
};