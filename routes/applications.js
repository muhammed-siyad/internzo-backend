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

        // ==========================================
        // GET TOKEN FROM AUTHORIZATION HEADER
        // ==========================================

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token =
            authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        // ==========================================
        // VERIFY TOKEN
        // ==========================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ==========================================
        // ONLY STUDENTS CAN APPLY
        // ==========================================

        if (decoded.role !== "student") {
            return res.status(403).json({
                message:
                    "Only students can apply for internships"
            });
        }

        // ==========================================
        // GET INTERNSHIP ID
        // ==========================================

        const { internshipId } = req.body;

        if (!internshipId) {
            return res.status(400).json({
                message: "Internship ID is required"
            });
        }

        // ==========================================
        // FIND INTERNSHIP
        // ==========================================

        const internshipData =
            await Internship.findById(internshipId);

        if (!internshipData) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        // ==========================================
        // ONLY APPROVED INTERNSHIPS
        // ==========================================

        if (internshipData.status !== "Approved") {
            return res.status(400).json({
                message:
                    "This internship is not available for applications"
            });
        }

        // ==========================================
        // CHECK DEADLINE
        // ==========================================

        if (
            internshipData.deadline &&
            new Date(internshipData.deadline) < new Date()
        ) {
            return res.status(400).json({
                message: "Application deadline has passed"
            });
        }

        // ==========================================
        // CHECK DUPLICATE APPLICATION
        // ==========================================

        const existingApplication =
            await Application.findOne({
                student: decoded.id,
                internship: internshipData._id
            });

        if (existingApplication) {
            return res.status(400).json({
                message:
                    "You have already applied for this internship"
            });
        }

        // ==========================================
        // CREATE APPLICATION
        // ==========================================

        const application =
            new Application({

                student: decoded.id,

                internship: internshipData._id,

                company: internshipData.company,

                status: "Applied"

            });

        await application.save();

        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({
            message:
                "Application submitted successfully",

            application
        });

    } catch (error) {

        console.error(
            "APPLICATION ERROR:",
            error
        );

        // ==========================================
        // INVALID / EXPIRED TOKEN
        // ==========================================

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message:
                    "Invalid or expired token"
            });
        }

        // ==========================================
        // INVALID MONGODB ID
        // ==========================================

        if (error.name === "CastError") {
            return res.status(400).json({
                message:
                    "Invalid internship ID"
            });
        }

        // ==========================================
        // SERVER ERROR
        // ==========================================

        res.status(500).json({
            message:
                "Server error"
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
                message:
                    "Please login first"
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

        // ==========================================
        // ONLY STUDENTS
        // ==========================================

        if (decoded.role !== "student") {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }

        // ==========================================
        // GET APPLICATIONS
        // ==========================================

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

        console.error(
            "MY APPLICATIONS ERROR:",
            error
        );

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message:
                    "Invalid or expired token"
            });
        }

        res.status(500).json({
            message:
                "Server error"
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
                message:
                    "Please login first"
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

        // ==========================================
        // ONLY COMPANIES
        // ==========================================

        if (decoded.role !== "company") {
            return res.status(403).json({
                message:
                    "Only companies can view applications"
            });
        }

        // ==========================================
        // GET COMPANY APPLICATIONS
        // ==========================================

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

        console.error(
            "COMPANY APPLICATIONS ERROR:",
            error
        );

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message:
                    "Invalid or expired token"
            });
        }

        res.status(500).json({
            message:
                "Server error"
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
                message:
                    "Please login first"
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

        // ==========================================
        // ONLY COMPANIES
        // ==========================================

        if (decoded.role !== "company") {
            return res.status(403).json({
                message:
                    "Only companies can update applications"
            });
        }

        // ==========================================
        // GET STATUS
        // ==========================================

        const { status } = req.body;

        const allowedStatuses = [
            "Shortlisted",
            "Rejected",
            "Selected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid application status"
            });
        }

        // ==========================================
        // FIND APPLICATION
        // ==========================================

        const application =
            await Application.findOne({
                _id: req.params.id,
                company: decoded.id
            });

        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found"
            });
        }

        // ==========================================
        // UPDATE STATUS
        // ==========================================

        application.status = status;

        await application.save();

        res.json({
            message:
                "Application status updated successfully",

            application
        });

    } catch (error) {

        console.error(
            "UPDATE APPLICATION ERROR:",
            error
        );

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message:
                    "Invalid or expired token"
            });
        }

        res.status(500).json({
            message:
                "Server error"
        });
    }
});


module.exports = router;