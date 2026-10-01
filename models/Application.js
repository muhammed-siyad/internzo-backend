const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
    {
        // Student who applied
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Internship the student applied for
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true
        },

        // Company that owns the internship
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Application status
        status: {
            type: String,
            enum: [
                "Applied",
                "Shortlisted",
                "Rejected",
                "Selected"
            ],
            default: "Applied"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Application",
    applicationSchema
);