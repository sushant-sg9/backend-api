const asyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");
const Admin = require("../models/adminModels");
const User  = require("../models/userModel"); 

const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const superAdminEmail = "superadmin@gmail.com";
    const superAdminPassword = "Admin@123";

    if (email !== superAdminEmail) {
        res.status(401);
        throw new Error("Invalid email");
    }

    let admin = await Admin.findOne({ email: superAdminEmail });

    if (!admin) {
        admin = await Admin.create({
            email: superAdminEmail,
            password: superAdminPassword, 
        });
    }

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            email: admin.email,
            token: generateToken(admin._id), 
            message: "Admin login successful",
        });
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({}).select('-password -__v');
        res.status(200).json({
            sucess: true,
            message: "Users retrieved successfully",
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to retrieve users');
    }
});

module.exports = { adminLogin, getAllUsers };
