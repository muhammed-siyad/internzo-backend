const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();


// ==================================================
// REGISTER
// Student and Company only
// ==================================================

router.post("/register", async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }


        // Public registration only allows student/company

        if (
            role !== "student" &&
            role !== "company"
        ) {
            return res.status(400).json({
                message: "Invalid registration role"
            });
        }


        // Check existing email

        const existingUser =
            await User.findOne({ email });


        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        });


        await user.save();


        res.status(201).json({
            message: "Registration successful"
        });


    } catch (error) {

        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });

    }
});


// ==================================================
// LOGIN
// ==================================================

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }


        // Find user

        const user =
            await User.findOne({ email });


        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Check password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }


        // Create token

        const token =
            jwt.sign(
                {
                    id: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


        res.json({

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });

    }
});


// ==================================================
// CREATE ADMIN
// TEMPORARY SETUP ROUTE
// ==================================================

router.post("/create-admin", async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Please provide name, email and password"
            });
        }


        // Check if email already exists

        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            // If the user already exists,
            // change the account to admin.

            existingUser.role = "admin";

            existingUser.password =
                await bcrypt.hash(
                    password,
                    10
                );

            existingUser.name = name;

            await existingUser.save();


            return res.json({
                message:
                    "Existing account converted to admin successfully"
            });
        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Create admin

        const admin =
            new User({

                name: name,

                email: email,

                password: hashedPassword,

                role: "admin"

            });


        await admin.save();


        res.status(201).json({
            message:
                "Admin account created successfully"
        });


    } catch (error) {

        console.error(
            "CREATE ADMIN ERROR:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }
});


module.exports = router;