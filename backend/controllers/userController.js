const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
    const { name, mobileCode, mobile, city, email } = req.body

    const loginType = "normal"

        if (!name || !mobile || !city || !email) {
            res.status(400)
            throw new Error("Please Enter all the Feilds")
        } else if (!mobileCode) {
            res.status(400)
            throw new Error("Error In Mobile Code Not found")
        }

    const userExists = await User.findOne({
        $or: [
            { mobile: req.body.mobile },
            { email: req.body.email }
        ]
    });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({ name, mobileCode, mobile, city, email, loginType })
    if (user) {
        const otp = Math.floor(1000 + Math.random() * 9000);
        res.status(201).json({
            message: "Registration successful",
            _id: user._id,
            name: user.name,
            mobileCode: user.mobileCode,
            mobile: user.mobile,
            email: user.email,
            city: user.city,
            loginType: user.loginType,
            token: generateToken(user._id),
            otp: otp,
        })
    } else {
        res.status(400)
        throw new Error("Failed to Create the User")
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { mobileCode, mobile, loginType, name, email, photoURL, uid } = req.body;

    if (loginType && loginType === 'google') {
        const user = await User.findOne({ email });

        if (!user) {
            const newUser = await User.create({
                name,
                uid,
                email,
                photoURL,
                loginType,
                lastLogin: new Date()
            });

            res.status(201).json({
                message: 'User Login successfully',
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                photoURL: newUser.photoURL,
                loginType: newUser.loginType,
                uid: newUser.uid,
                token: generateToken(newUser._id)
            });
        } else {
           
            user.lastLogin = new Date();
            if (photoURL) user.photoURL = photoURL;
            await user.save();

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                loginType: user.loginType,
                uid: user.uid,
                token: generateToken(user._id),
                message: "User already exists. Logged in successfully."
            });
        }
    } else {
        const user = await User.findOne({ mobile });

        if (user && mobileCode === user.mobileCode) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            
            user.lastLogin = new Date();
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                mobile: user.mobile,
                city: user.city,
                email: user.email,
                loginType: user.loginType,
                token: generateToken(user._id),
                otp: otp,
            });
        } else {
            res.status(401);
            throw new Error("Invalid mobile or country code");
        }
    }
});

const allUsersBySearch = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {}
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)

})

const getUserDetails = asyncHandler(async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        res.status(400);
        throw new Error('User ID is required');
    }

    try {
        const user = await User.findById(_id)
            .select('-__v'); 
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const userObject = user.toObject();

        res.json({
            success: true,
            data: userObject
        });

    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw new Error(error.message);
    }
});

const deleteUserDetails = asyncHandler(async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        res.status(400);
        throw new Error('User ID is required');
    }

    try {
        const user = await User.findById(_id);
        
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        await User.findByIdAndDelete(_id);

        res.json({
            success: true,
            message: 'User deleted successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw new Error(error.message);
    }
});

// const addVideoLink = asyncHandler(async (req, res) => {
//     const { _id, videoLink } = req.body;

//     if (!_id || !videoLink) {
//         res.status(400);
//         throw new Error('User ID and video link are required');
//     }

//     try {
//         const user = await User.findById(_id);

//         if (!user) {
//             res.status(404);
//             throw new Error('User not found');
//         }

//         if (!user.videoLinks) {
//             user.videoLinks = [];
//         }

//         const existingLinkIndex = user.videoLinks.findIndex(
//             video => video.link === videoLink
//         );

//         if (existingLinkIndex !== -1) {
//             user.videoLinks[existingLinkIndex].count += 1;
//             user.videoLinks[existingLinkIndex].date = new Date();
//         } else {
//             user.videoLinks.push({
//                 link: videoLink,
//                 count: 1,
//                 date: new Date()
//             });
//         }

//         const updatedUser = await user.save();

//         res.status(200).json({
//             success: true,
//             message: 'Video link added successfully',
//             data: {
//                 _id: updatedUser._id,
//                 name: updatedUser.name,
//                 email: updatedUser.email,
//                 videoLinks: updatedUser.videoLinks
//             }
//         });

//     } catch (error) {
//         res.status(500);
//         throw new Error(error.message);
//     }
// });

const addVideoLink = asyncHandler(async (req, res) => {
    const { _id, videoLink } = req.body;

    if (!_id || !videoLink) {
        res.status(400);
        throw new Error('User ID and video link are required');
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.status = 'active';

        if (!user.videoLinks) {
            user.videoLinks = [];
        }

        const existingLinkIndex = user.videoLinks.findIndex(
            video => video.link === videoLink
        );

        if (existingLinkIndex !== -1) {
            user.videoLinks[existingLinkIndex].count += 1;
            user.videoLinks[existingLinkIndex].date = new Date();
        } else {
            user.videoLinks.push({
                link: videoLink,
                count: 1,
                date: new Date()
            });
        }

        const updatedUser = await user.save();

        setTimeout(async () => {
            try {
                const currentUser = await User.findById(_id);
                if (currentUser) {
                    currentUser.status = 'inactive';
                    await currentUser.save();
                }
            } catch (error) {
                console.error('Error updating user status:', error);
            }
        }, 60000); //300000

        res.status(200).json({
            success: true,
            message: 'Video link added successfully',
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                videoLinks: updatedUser.videoLinks,
                status: updatedUser.status,
            }
        });

    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

const updateUserById = asyncHandler(async (req, res) => {
    const { 
        _id, 
        name, 
        email, 
        dateOfBirth, 
        gender, 
        occupation, 
        relationshipStatus, 
        language, 
        preferredContactMethod, 
        favoriteDanceStyle, 
        skillLevel, 
        profileImage, 
        country, 
        state, 
        city, 
        mobile, 
        mobileCode 
    } = req.body;

    if (!_id) {
        res.status(400);
        throw new Error('User ID is required');
    }

    try {
        const user = await User.findById(_id);
        
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ 
                email, 
                _id: { $ne: _id } 
            });
            
            if (emailExists) {
                res.status(400);
                throw new Error('Email already in use use different email');
            }
        }

        if (mobile && mobile !== user.mobile) {
            const mobileExists = await User.findOne({ 
                mobile, 
                _id: { $ne: _id } 
            });
            
            if (mobileExists) {
                res.status(400);
                throw new Error('Mobile number already in use different mobile');
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                $set: {
                    name: name || user.name,
                    email: email || user.email,
                    dateOfBirth: dateOfBirth || user.dateOfBirth,
                    gender: gender || user.gender,
                    occupation: occupation || user.occupation,
                    relationshipStatus: relationshipStatus || user.relationshipStatus,
                    language: language || user.language,
                    preferredContactMethod: preferredContactMethod || user.preferredContactMethod,
                    favoriteDanceStyle: favoriteDanceStyle || user.favoriteDanceStyle,
                    skillLevel: skillLevel || user.skillLevel,
                    profileImage: profileImage || user.profileImage,
                    country: country || user.country,
                    state: state || user.state,
                    city: city || user.city,
                    mobile: mobile || user.mobile,
                    mobileCode: mobileCode || user.mobileCode
                }
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                occupation: updatedUser.occupation,
                relationshipStatus: updatedUser.relationshipStatus,
                language: updatedUser.language,
                preferredContactMethod: updatedUser.preferredContactMethod,
                favoriteDanceStyle: updatedUser.favoriteDanceStyle,
                skillLevel: updatedUser.skillLevel,
                profileImage: updatedUser.profileImage,
                country: updatedUser.country,
                state: updatedUser.state,
                city: updatedUser.city,
                mobile: updatedUser.mobile,
                mobileCode: updatedUser.mobileCode
            }
        });

    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw new Error(error.message);
    }
});

const getVideoLinkDetails = asyncHandler(async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        res.status(400);
        throw new Error('User ID is required');
    }

    try {
        const user = await User.findById(_id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({  
            success: true,
            message: 'Video links fetched successfully',
            data: user.videoLinks
        });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw new Error(error.message);
    }

});


module.exports = { registerUser, authUser, allUsersBySearch, getUserDetails, deleteUserDetails, addVideoLink, updateUserById, getVideoLinkDetails }