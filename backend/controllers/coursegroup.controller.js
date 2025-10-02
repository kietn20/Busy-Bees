const CourseGroup = require("../models/CourseGroup.model");

// creates a new course group
exports.createCourseGroup = (req, res) => {
  res.status(201).json({ message: "Stub: createCourseGroup" });
};

// gets all course groups or a specific course group by ID
exports.getCourseGroups = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroups" });
};

// gets a specific course group by ID
exports.getCourseGroupById = (req, res) => {
  res.status(200).json({ message: "Stub: getCourseGroupById" });
};

// updates a specific course group by ID
exports.updateCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: updateCourseGroup" });
};

// deletes a specific course group by ID
exports.deleteCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: deleteCourseGroup" });
};

// adds a user to a course group
exports.addUserToCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: addUserToCourseGroup" });
};

// removes a user from a course group
exports.removeUserFromCourseGroup = (req, res) => {
  res.status(200).json({ message: "Stub: removeUserFromCourseGroup" });
};

// transfers ownership of a course group to another user
exports.transferCourseGroupOwnership = (req, res) => {
  res.status(200).json({ message: "Stub: transferCourseGroupOwnership" });
};

// gets all members of a course group
exports.getGroupMembers = (req, res) => {
  res.status(200).json({ message: "Stub: getGroupMembers" });
};