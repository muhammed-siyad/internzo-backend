const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        phone: {
            type: String,
            trim: true
        },

        college: {
            type: String,
            trim: true
        },

        course: {
            type: String,
            trim: true
        },

        education: {
            type: String,
            trim: true
        },

        skills: {
            type: [String],
            default: []
        },

        bio: {
            type: String,
            trim: true
        },

        resume: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "StudentProfile",
    studentProfileSchema
);