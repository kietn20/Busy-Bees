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
    // we have dual storage for owner id which is redundant
    // but you can get the owner id w/o searching the members array
    // i just didnt want to remove ownerId if other parts of the code rely on it 
    members: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: { // added role to distinguish between owner and members
                type: String,
                enum: ["owner", "member"],
                default: "member"
            }
        }
    ],
 },
 {
    timestamps: true
 }

)

module.exports = mongoose.model("CourseGroup", courseGroupSchema);