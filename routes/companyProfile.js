const express = require("express");
const jwt = require("jsonwebtoken");
const CompanyProfile = require("../models/CompanyProfile");

const router = express.Router();


// ===============================
// GET COMPANY PROFILE
// ===============================
router.get("/", async (req, res) => {
    try {
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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Only companies can access this profile"
            });
        }

        const profile = await CompanyProfile.findOne({
            company: decoded.id
        }).populate(
            "company",
            "name email"
        );

        if (!profile) {
            return res.json({
                company: decoded.id,
                companyName: "",
                phone: "",
                website: "",
                location: "",
                industry: "",
                description: "",
                founded: "",
                employees: ""
            });
        }

        res.json(profile);

    } catch (error) {
        console.error("GET COMPANY PROFILE ERROR:", error);

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


// ===============================
// SAVE / UPDATE COMPANY PROFILE
// ===============================
router.post("/", async (req, res) => {
    try {
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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "company") {
            return res.status(403).json({
                message: "Only companies can update this profile"
            });
        }

        const {
            companyName,
            phone,
            website,
            location,
            industry,
            description,
            founded,
            employees
        } = req.body;

        const profile =
            await CompanyProfile.findOneAndUpdate(
                {
                    company: decoded.id
                },
                {
                    company: decoded.id,
                    companyName,
                    phone,
                    website,
                    location,
                    industry,
                    description,
                    founded,
                    employees
                },
                {
                    new: true,
                    upsert: true
                }
            );

        res.json({
            message: "Company profile saved successfully",
            profile
        });

    } catch (error) {
        console.error("SAVE COMPANY PROFILE ERROR:", error);

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