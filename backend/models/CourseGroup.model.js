const mongoose = require("mongoose");

const courseGroupSchema = new mongoose.Schema(
  {
    groupName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    ownerId: { // reference to the User who owns the group
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    // users who accept invite will be stored here
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    // users invited will be stored here
    // users will be removed if they decline invite
    invites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
 }

)

module.exports = mongoose.model("CourseGroup", courseGroupSchema);