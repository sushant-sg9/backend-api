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


const getPopularity = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({}, 'videoLinks');

        const allLinks = users.flatMap(user => 
            user.videoLinks.map(video => ({
                link: video.link,
                userId: user._id,
                userCount: video.count 
            }))
        );

        const linkCountMap = allLinks.reduce((acc, { link, userId, userCount }) => {
            if (!acc[link]) {
                acc[link] = { count: 0, users: [] };
            }
            acc[link].count += 1;
            acc[link].users.push({ userId, count: userCount });
            return acc;
        }, {});

        const sortedLinks = Object.entries(linkCountMap)
            .map(([link, { count, users }]) => ({
                link,
                count,
                users: users.sort((a, b) => b.count - a.count)  
            }))
            .sort((a, b) => b.count - a.count);  

        res.status(200).json({
            success: true,
            message: "Video links retrieved successfully by popularity",
            data: sortedLinks,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to retrieve video links by popularity');
    }
});

const getUserById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.status(200).json({
            success: true,
            message: 'User data retrieved successfully',
            data: user,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to retrieve user data');
    }
});

module.exports = { adminLogin, getAllUsers, getPopularity, getUserById };
