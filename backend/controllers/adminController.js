const asyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");
const Admin = require("../models/adminModels");
const User  = require("../models/userModel"); 
const Designation = require("../models/designationModels")

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
                acc[link] = { userCount: 0, totalLinkUse: 0, users: [] };
            }
            acc[link].userCount += 1;
            acc[link].totalLinkUse += userCount;
            acc[link].users.push({ userId, count: userCount });
            return acc;
        }, {});

        const sortedLinks = Object.entries(linkCountMap)
            .map(([link, { userCount, totalLinkUse, users }]) => ({
                link,
                userCount,
                totalLinkUse,
                users: users.sort((a, b) => b.count - a.count)  
            }))
            .sort((a, b) => b.userCount - a.userCount);  

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

const getMultipleUserInfo = asyncHandler(async (req, res) => {
    try {
        const userIds = req.params.userIds; 
        if (!userIds) {
          return res.status(400).json({ message: 'User IDs are required.' });
        }
    
        const idsArray = userIds.split(',');
    
        const users = await User.find({ _id: { $in: idsArray } });
        
        return res.json(users);
      } catch (error) {
        console.error('Error fetching user information:', error);
        return res.status(500).json({ message: 'Internal server error.' });
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


const changeAdminPassword = asyncHandler(async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    const superAdminEmail = "superadmin@gmail.com";

    if (email !== superAdminEmail) {
        res.status(401);
        throw new Error("Invalid email");
    }

    let admin = await Admin.findOne({ email: superAdminEmail });

    if (!admin) {
        res.status(404);
        throw new Error("Admin not found");
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
        message: "Password changed successfully",
    });
});

const addDesignation = asyncHandler(async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400);
            throw new Error("Designation name is required");
        }

        const existingDesignation = await Designation.findOne({ name });
        if (existingDesignation) {
            res.status(400);
            throw new Error("Designation already exists");
        }

        const designation = await Designation.create({
            name
        });

        res.status(200).json({
            success: true,
            message: "Designation added successfully",
            data: designation
        });
    } catch (error) {
        res.status(error.status || 500);
        throw new Error(error.message || 'Failed to add designation');
    }
});

const getAllDesignations = asyncHandler(async (req, res) => {
    try {
        const designations = await Designation.find({})
            .select('name')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            message: "Designations retrieved successfully",
            count: designations.length,
            data: designations
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to retrieve designations');
    }
});


module.exports = { adminLogin, getAllUsers, getPopularity, getUserById, changeAdminPassword , getMultipleUserInfo, addDesignation, getAllDesignations};
