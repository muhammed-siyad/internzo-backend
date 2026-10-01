const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        companyName: {
            type: String,
            required: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: ["Full Time", "Part Time", "Remote"],
            required: true
        },

        duration: {
            type: String,
            required: true
        },

        stipend: {
            type: String,
            default: "Unpaid"
        },

        deadline: {
            type: Date,
            required: true
        },

        skills: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            required: true
        },

        requirements: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Internship",
    internshipSchema
);