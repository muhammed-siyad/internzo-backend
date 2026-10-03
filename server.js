const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");


// ==================================================
// LOAD ENVIRONMENT VARIABLES
// ==================================================

dotenv.config({
    path: path.join(__dirname, ".env")
});


// ==================================================
// CREATE APP
// ==================================================

const app = express();


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==================================================
// DATABASE
// ==================================================

const MONGO_URI =
    process.env.MONGO_URI;

if (!MONGO_URI) {

    console.error(
        "MONGO_URI is not defined"
    );

    process.exit(1);

}


// ==================================================
// ROUTES
// ==================================================

const authRoutes =
    require("./routes/auth");

const applicationRoutes =
    require("./routes/applications");

const profileRoutes =
    require("./routes/profile");

const internshipRoutes =
    require("./routes/internships");

const companyProfileRoutes =
    require("./routes/companyProfile");


// ==================================================
// API ROUTES
// ==================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/applications",
    applicationRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);

app.use(
    "/api/internships",
    internshipRoutes
);

app.use(
    "/api/company-profile",
    companyProfileRoutes
);


// ==================================================
// ROOT TEST ROUTE
// ==================================================

app.get("/", (req, res) => {

    res.json({

        message:
            "INTERNZO API is running!",

        version:
            "DELETE-ROUTE-TEST-2026"

    });

});


// ==================================================
// 404 ROUTE
// ==================================================

app.use((req, res) => {

    console.log(
        "404 ROUTE:",
        req.method,
        req.originalUrl
    );

    res.status(404).json({

        message:
            "Route not found",

        method:
            req.method,

        path:
            req.originalUrl

    });

});


// ==================================================
// MONGODB CONNECTION
// ==================================================

mongoose
    .connect(MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );


        // ==================================================
        // START SERVER
        // ==================================================

        const PORT =
            process.env.PORT || 5000;


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    });