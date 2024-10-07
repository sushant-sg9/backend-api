const asyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");
const Admin = require("../models/adminModels"); 

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const superAdminEmail = "superadmin@gmail.com";
    const superAdminPassword = "Admin@123";

    if (email !== superAdminEmail) {
        res.status(401);
        throw new Error("Invalid email");
    }

    let admin = await Admin.findOne({ email: superAdminEmail });
    console.log("Admin found:", admin);

    if (!admin) {
        admin = await Admin.create({
            email: superAdminEmail,
            password: superAdminPassword, 
        });
        console.log("Admin created with email:", superAdminEmail);
    }

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            email: admin.email,
            token: generateToken(admin.email), 
            message: "Admin login successful",
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

module.exports = { adminLogin };
