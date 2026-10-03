const express = require("express");
const jwt = require("jsonwebtoken");
const Internship = require("../models/Internship");

const router = express.Router();

// ==================================================
// ADMIN AUTHENTICATION
// ==================================================

function verifyAdmin(req, res, next) {

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

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        req.admin = decoded;

        next();

    } catch (error) {

        console.error(
            "ADMIN AUTH ERROR:",
            error
        );

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
}


// ==================================================
// COMPANY - POST INTERNSHIP
// ==================================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                company,
                companyName,
                title,
                description,
                location,
                type,
                duration,
                stipend,
                deadline,
                skills
            } = req.body;

            if (!company) {
                return res.status(400).json({
                    message: "Company ID is required"
                });
            }

            if (!companyName) {
                return res.status(400).json({
                    message: "Company name is required"
                });
            }

            if (!title) {
                return res.status(400).json({
                    message: "Internship title is required"
                });
            }

            const internship =
                new Internship({

                    company,

                    companyName,

                    title,

                    description,

                    location,

                    type,

                    duration,

                    stipend,

                    deadline,

                    skills,

                    status: "Pending"

                });

            await internship.save();

            res.status(201).json({

                message:
                    "Internship posted successfully",

                internship

            });

        } catch (error) {

            console.error(
                "POST INTERNSHIP ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==================================================
// GET APPROVED INTERNSHIPS
// ==================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const internships =
                await Internship.find({
                    status: "Approved"
                }).sort({
                    createdAt: -1
                });

            res.json(internships);

        } catch (error) {

            console.error(
                "GET INTERNSHIPS ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==================================================
// GET COMPANY INTERNSHIPS
// ==================================================

router.get(
    "/my-internships",
    async (req, res) => {

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

            const internships =
                await Internship.find({
                    company: decoded.id
                }).sort({
                    createdAt: -1
                });

            res.json(internships);

        } catch (error) {

            console.error(
                "MY INTERNSHIPS ERROR:",
                error
            );

            res.status(401).json({
                message:
                    "Invalid or expired token"
            });

        }

    }
);


// ==================================================
// ADMIN - GET ALL INTERNSHIPS
// ==================================================

router.get(
    "/admin/all",
    verifyAdmin,
    async (req, res) => {

        try {

            const internships =
                await Internship.find()
                    .sort({
                        createdAt: -1
                    });

            res.json(internships);

        } catch (error) {

            console.error(
                "ADMIN GET INTERNSHIPS ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==================================================
// ADMIN - APPROVE / REJECT INTERNSHIP
// ==================================================

router.put(
    "/admin/status/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            if (
                !status ||
                !["Approved", "Rejected"]
                    .includes(status)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid internship status"
                });

            }

            const internship =
                await Internship.findById(
                    req.params.id
                );

            if (!internship) {

                return res.status(404).json({
                    message:
                        "Internship not found"
                });

            }

            internship.status =
                status;

            await internship.save();

            res.json({

                message:
                    `Internship ${status.toLowerCase()} successfully`,

                internship

            });

        } catch (error) {

            console.error(
                "UPDATE INTERNSHIP STATUS ERROR:",
                error
            );

            if (
                error.name === "CastError"
            ) {

                return res.status(400).json({
                    message:
                        "Invalid internship ID"
                });

            }

            res.status(500).json({
                message: "Server error"
            });

        }

    }
);


// ==================================================
// TEST - CHECK INTERNSHIP ROUTE
// ==================================================

router.get(
    "/test-delete-route",
    (req, res) => {

        res.json({
            message:
                "DELETE route file is loaded"
        });

    }
);


// ==================================================
// ADMIN - TEMPORARY DELETE TEST
// ==================================================

router.delete(
    "/admin/:id",
    verifyAdmin,
    async (req, res) => {

        console.log(
            "DELETE ROUTE REACHED:",
            req.params.id
        );

        res.json({

            message:
                "DELETE ROUTE IS WORKING",

            internshipId:
                req.params.id

        });

    }
);


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;