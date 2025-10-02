const CourseGroup = require("../models/CourseGroup.model");

// creates a new course group
exports.createCourseGroup = (req, res) => {
  res.status(201).json({ message: "Stub: createCourseGroup" });
};

// gets all course groups
exports.getCourseGroups = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroups" });
};

// gets a specific course group by ID
exports.getCourseGroupById = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroupById" });
};

// updates a specific course group by ID (owners only)
exports.updateCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: updateCourseGroup" });
};

// deletes a specific course group by ID (owners only)
exports.deleteCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: deleteCourseGroup" });
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
