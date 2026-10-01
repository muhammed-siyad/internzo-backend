const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        companyName: {
            type: String,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        website: {
            type: String,
            trim: true
        },

        location: {
            type: String,
            trim: true
        },

        industry: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        founded: {
            type: String,
            trim: true
        },

        employees: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CompanyProfile",
    companyProfileSchema
);