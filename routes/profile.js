const express = require("express");
const jwt = require("jsonwebtoken");
const StudentProfile = require("../models/StudentProfile");

const router = express.Router();

// =========================================
// GET STUDENT PROFILE
// =========================================

router.get("/", async (req, res) => {

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

        const profile =
            await StudentProfile.findOne({
                student: decoded.id
            }).populate(
                "student",
                "name email"
            );

        if (!profile) {

            return res.json({
                student: decoded.id,
                phone: "",
                college: "",
                course: "",
                education: "",
                skills: [],
                bio: "",
                resume: ""
            });

        }

        res.json(profile);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// =========================================
// CREATE / UPDATE STUDENT PROFILE
// =========================================

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

        const {
            phone,
            college,
            course,
            education,
            skills,
            bio,
            resume
        } = req.body;


        const profile =
            await StudentProfile.findOneAndUpdate(
                {
                    student: decoded.id
                },
                {
                    student: decoded.id,
                    phone,
                    college,
                    course,
                    education,
                    skills,
                    bio,
                    resume
                },
                {
                    new: true,
                    upsert: true
                }
            );


        res.json({
            message: "Profile saved successfully",
            profile
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


module.exports = router;