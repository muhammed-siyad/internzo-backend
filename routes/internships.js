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

router.post("/", async (req, res) => {

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


        if (decoded.role !== "company") {

            return res.status(403).json({
                message:
                    "Only companies can post internships"
            });

        }


        const {
            title,
            companyName,
            location,
            type,
            duration,
            stipend,
            deadline,
            skills,
            description,
            requirements
        } = req.body;


        if (
            !title ||
            !companyName ||
            !location ||
            !type ||
            !duration ||
            !deadline ||
            !description
        ) {

            return res.status(400).json({
                message:
                    "Please fill all required fields"
            });

        }


        // Convert skills to array

        let skillsArray = [];


        if (Array.isArray(skills)) {

            skillsArray = skills;

        } else if (
            typeof skills === "string"
        ) {

            skillsArray =
                skills
                    .split(",")
                    .map(skill =>
                        skill.trim()
                    )
                    .filter(
                        skill =>
                            skill !== ""
                    );

        }


        // Create internship

        const internship =
            new Internship({

                company: decoded.id,

                companyName,

                title,

                location,

                type,

                duration,

                stipend:
                    stipend || "Unpaid",

                deadline,

                skills:
                    skillsArray,

                description,

                requirements:
                    requirements || "",

                // New internships need admin approval

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


        if (
            error.name ===
                "JsonWebTokenError" ||
            error.name ===
                "TokenExpiredError"
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


// ==================================================
// STUDENT - GET APPROVED INTERNSHIPS
// ==================================================

router.get("/", async (req, res) => {

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

            message:
                "Server error"

        });

    }

});


// ==================================================
// COMPANY - GET MY INTERNSHIPS
// ==================================================

router.get(
    "/my-internships",
    async (req, res) => {

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
                authHeader.startsWith(
                    "Bearer "
                )
                    ? authHeader.substring(7)
                    : authHeader;


            const decoded =
                jwt.verify(

                    token,

                    process.env.JWT_SECRET

                );


            if (
                decoded.role !==
                "company"
            ) {

                return res.status(403).json({

                    message:
                        "Access denied"

                });

            }


            const internships =
                await Internship.find({

                    company:
                        decoded.id

                }).sort({

                    createdAt: -1

                });


            res.json(internships);


        } catch (error) {

            console.error(
                "GET COMPANY INTERNSHIPS ERROR:",
                error
            );


            if (
                error.name ===
                    "JsonWebTokenError" ||
                error.name ===
                    "TokenExpiredError"
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

                    .populate(
                        "company",
                        "name email"
                    )

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

                message:
                    "Server error"

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


            // Only these statuses are allowed

            if (
                status !== "Approved" &&
                status !== "Rejected"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid status"

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
                error.name ===
                    "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid internship ID"

                });

            }


            res.status(500).json({

                message:
                    "Server error"

            });

        }

    }
);


// ==================================================
// ADMIN - DELETE / REMOVE INTERNSHIP
// ==================================================

router.delete(
    "/admin/:id",
    verifyAdmin,
    async (req, res) => {

        try {

            const internshipId =
                req.params.id;


            // Check ID

            if (!internshipId) {

                return res.status(400).json({

                    message:
                        "Internship ID is required"

                });

            }


            // Find internship

            const internship =
                await Internship.findById(
                    internshipId
                );


            if (!internship) {

                return res.status(404).json({

                    message:
                        "Internship not found"

                });

            }


            // Delete internship

            await Internship.findByIdAndDelete(
                internshipId
            );


            res.json({

                message:
                    "Internship removed successfully"

            });


        } catch (error) {

            console.error(
                "DELETE INTERNSHIP ERROR:",
                error
            );


            // Invalid MongoDB ObjectId

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid internship ID"

                });

            }


            res.status(500).json({

                message:
                    "Server error"

            });

        }

    }
);


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;