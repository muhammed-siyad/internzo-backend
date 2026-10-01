const express = require("express");
const jwt = require("jsonwebtoken");
const Application = require("../models/Application");
const Internship = require("../models/Internship");

const router = express.Router();


// ==========================================
// STUDENT APPLY FOR INTERNSHIP
// ==========================================

router.post("/apply", async (req, res) => {
    try {

        const { token, internship } = req.body;

        // Check token
        if (!token) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Only students can apply
        if (decoded.role !== "student") {
            return res.status(403).json({
                message: "Only students can apply for internships"
            });
        }

        // Check internship ID
        if (!internship) {
            return res.status(400).json({
                message: "Internship is required"
            });
        }

        // Find internship
        const internshipData =
            await Internship.findById(internship);

        if (!internshipData) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        // Only approved internships can receive applications
        if (internshipData.status !== "Approved") {
            return res.status(400).json({
                message: "This internship is not available for applications"
            });
        }

        // Check deadline
        if (
            new Date(internshipData.deadline) <
            new Date()
        ) {
            return res.status(400).json({
                message: "Application deadline has passed"
            });
        }

        // Check duplicate application
        const existingApplication =
            await Application.findOne({
                student: decoded.id,
                internship: internshipData._id
            });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this internship"
            });
        }

        // Create application
        const application =
            new Application({

                student: decoded.id,

                internship: internshipData._id,

                company: internshipData.company,

                status: "Applied"

            });

        await application.save();

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {

        console.error(error);

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// STUDENT - VIEW MY APPLICATIONS
// ==========================================

router.get("/my-applications", async (req, res) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // Only students
        if (decoded.role !== "student") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const applications =
            await Application.find({
                student: decoded.id
            })
            .populate(
                "internship",
                "title companyName location type duration stipend deadline"
            )
            .populate(
                "company",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        res.json(applications);

    } catch (error) {

        console.error(error);

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// COMPANY - VIEW APPLICATIONS
// ==========================================

router.get("/company-applications", async (req, res) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // Only companies
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Only companies can view applications"
            });
        }

        const applications =
            await Application.find({
                company: decoded.id
            })
            .populate(
                "student",
                "name email"
            )
            .populate(
                "internship",
                "title companyName location type"
            )
            .sort({
                createdAt: -1
            });

        res.json(applications);

    } catch (error) {

        console.error(error);

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==========================================
// COMPANY - UPDATE APPLICATION STATUS
// ==========================================

router.put("/status/:id", async (req, res) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // Only companies
        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Only companies can update applications"
            });
        }

        const { status } = req.body;

        // Allowed statuses
        const allowedStatuses = [
            "Shortlisted",
            "Rejected",
            "Selected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        // Find application belonging to this company
        const application =
            await Application.findOne({
                _id: req.params.id,
                company: decoded.id
            });

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        application.status = status;

        await application.save();

        res.json({
            message: "Application status updated successfully",
            application
        });

    } catch (error) {

        console.error(error);

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;