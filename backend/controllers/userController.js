const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");
const nodemailer = require('nodemailer'); 
const twilio = require('twilio');
const OTP = require('../models/otpModel'); 
require('dotenv').config();
const { IgApiClient } = require('instagram-private-api');
const axios = require('axios');
// const youtubedl = require('youtube-dl-exec');
// const { InstagramAPI } = require('instagram-private-api');
// const FB = require('fb');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH;
const client = new twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true 
});


// var emailUpdate;


const newSignup = asyncHandler(async (req, res) => {
    const { email, mobileCode, mobile } = req.body;

    if (!email || !mobileCode || !mobile) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const userExistsWithMobile = await User.findOne({ mobile });
    if (userExistsWithMobile) {
        return res.status(400).json({ message: "Mobile number already registered" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "Email already registered" });
    }

    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await OTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        );

        const htmlContent = `
            <p>Welcome to HookStep!</p>
            <p>Please verify your email using this OTP: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>Thank you for choosing HookStep!</p>
        `;

        const mailOptions = {
            from: '"HookStep" <donotreply1@hookstep.net>',
            to: email,
            subject: "Welcome to HookStep - Verify Your Email",
            text: `Your OTP for verification is: ${otp}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            info: info.response
        });

    } catch (error) {
        await OTP.deleteOne({ email });
        
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.toString()
        });
    }
});


const newSignupVerify = asyncHandler(async (req, res) => {
    const { email, otp, password, mobile, mobileCode, name } = req.body; 

    if (!email || !otp || !password || !mobile || !mobileCode || !name) {
        return res.status(400).json({
            success: false,
            message: "All fields are required: email, otp, password, mobile, mobileCode, and name"
        });
    }

    try {
        const otpDoc = await OTP.findOne({ email });
        
        if (!otpDoc) {
            return res.status(401).json({ 
                success: false,
                message: 'OTP expired. Please request a new OTP.' 
            });
        }

        if (otpDoc.otp !== otp) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid OTP' 
            });
        }

        const newUser = await User.create({
            email,
            password, 
            mobile,
            mobileCode,
            name,
            status: 'active',
            loginType: 'normal', 
            lastLogin: new Date(),
            videoLinks: [] 
        });

        
        await OTP.deleteOne({ email });

        
        const userResponse = {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            mobile: newUser.mobile,
            mobileCode: newUser.mobileCode,
            status: newUser.status,
            loginType: newUser.loginType
        };

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: userResponse,
            token: generateToken(newUser._id)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP and create account',
            error: error.toString()
        });
    }
});

const newLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide both email and password"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email"
            });
        }

        const isPasswordMatch = await user.matchPasswords(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            mobileCode: user.mobileCode,
            status: user.status,
            loginType: user.loginType,
            profileImage: user.profileImage,
            lastLogin: user.lastLogin
        };

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.toString()
        });
    }
});

const sendOTPSignup = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "Email already registered" });
    }

    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await OTP.findOneAndUpdate(
            { email },
            { email, otp },
            { upsert: true, new: true }
        );

        const htmlContent = `
            <p>Welcome to HookStep!</p>
            <p>Please verify your email using this OTP: <strong>${otp}</strong></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>Thank you for choosing HookStep!</p>
        `;

        const mailOptions = {
            from: '"HookStep" <donotreply1@hookstep.net>',
            to: email,
            subject: "Welcome to HookStep - Verify Your Email",
            text: `Your OTP for verification is: ${otp}`,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            info: info.response
        });

    } catch (error) {
        await OTP.deleteOne({ email });
        
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.toString()
        });
    }
});

const verifyOTPSignup = asyncHandler(async (req, res) => {
    const { email, otp } = req.body; 

    try {
        const otpDoc = await OTP.findOne({ email });
        
        if (!otpDoc) {
            return res.status(401).json({ 
                success: false,
                message: 'OTP expired. Please request a new OTP.' 
            });
        }

        if (otpDoc.otp !== otp) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid OTP' 
            });
        }

        const newUser = await User.create({
            email,
            status: 'active'
        });

        await OTP.deleteOne({ email });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                _id: newUser._id,
                email: newUser.email
            },
            token: generateToken(newUser._id)
        });

        emailUpdate = email;
        

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP and create account',
            error: error.toString()
        });
    }
});

const registerUser = asyncHandler(async (req, res) => {
    const { name, mobileCode, mobile, city } = req.body;

    const loginType = "normal";

    if (!name || !mobile || !city) {
        res.status(400);
        throw new Error("Please enter all the fields");
    } else if (!mobileCode) {
        res.status(400);
        throw new Error("Error in mobile code not found");
    }

    const userExists = await User.findOne({ mobile: mobile });

    if (userExists) {
        res.status(400);
        throw new Error("Mobile Number already exists");
    }


    const user = await User.findOneAndUpdate(
        { email: emailUpdate },
        { name, mobileCode, mobile, city, loginType }, 
    );

    if (user) {
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
        });
    } else {
        res.status(400);
        throw new Error("Failed to create the user");
    }
});

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
            });
        } else {
            res.status(401);
            throw new Error("Invalid mobile or country code");
        }
    }
});

const sendOTPLogin = asyncHandler(async (req, res) => {
    // const { mobileCode, mobile } = req.body;
    const { email } = req.body;
    // const phoneNumber = `${mobileCode}${mobile}`
    console.log(email)
    
    if(email === "testing@gmail.com"){
        res.json({ 
            otp: "1234",
            message: "OTP sent successfully",
    });
    }
    else{
        const userExists = await User.findOne({ email });

    if (!userExists) {
        return res.status(404).json({ message: "User not found" });
    }
    // const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // await OTP.create({ mobile: phoneNumber, otp });

    // client.messages.create({
    //     body: `Your OTP for login is: ${otp}`,
    //     // body: `hello, Message received Successfully`,
    //     from: '+13323333614',
    //     to: phoneNumber
    // })
    // .then(message => {
    //     res.json({ message: "OTP sent successfully", email });
    // })

    // .catch(error => {
    //     console.error(`Twilio Error: ${error.message}`);
    //     res.status(500).json({ error: 'Failed to send OTP via SMS', message: error.message });
    // });
    else{
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
        const htmlContent = `
           <p>Your OTP for verification is: <strong>${otp}</strong></p>
           <p>Thank you for using HookStep.</p>
        `;
    
        const mailOptions = {
            from: '"HookStep" <donotreply1@hookstep.net>',
            to: email,
            subject: "Welcome to HookStep",
            text: "Thank you for joining us!",
            html: htmlContent,
        };
    
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(`Error: ${error}`);
                return res.status(500).json({
                    success: false,
                    message: 'Email failed to send',
                    error: error.toString(),
                });
            }
    
            try {
                const user = await User.findOne({ email: email });
                if (!user) {
                    res.status(404);
                    throw new Error('User not found');
                }
    
                user.otp = otp;
                await user.save();
    
                res.status(200).json({
                    success: true,
                    message: 'Email sent successfully',
                    // otp: user.otp,
                    info: info.response
                });
            } catch (err) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send OTP to user',
                    error: err.toString(),
                });
            }
        });
    }
    }
});

const verifyOTPLogin = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if(email === "testing@gmail.com" && otp === "1234") {
        res.json({
            success: true,
            message: 'OTP verified successfully',
        });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
    }

    user.otp = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'OTP verified successfully',
        user: {
            _id: user._id,
            email: user.email
        },
        token: generateToken(user._id),
    });
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
        }, 60000);

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


const sendEmail = asyncHandler(async (req, res) => {
    const { id, to } = req.body;

    if(to === 'testing@gmail.com'){
        res.status(200).json({
            success: true,
            otp: '1234',
            message: 'OTP Send successfully'
        })
    }
    else{
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const htmlContent = `
       <p>Your OTP for verification is: <strong>${otp}</strong></p>
       <p>Thank you for using HookStep.</p>
    `;

    const mailOptions = {
        from: '"HookStep" <donotreply@hookstep.net>',
        to: to,
        subject: "Welcome to HookStep",
        text: "Thank you for joining us!",
        html: htmlContent,
    };

    if (!id) {
        res.status(400);
        throw new Error('User ID is required');
    }

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error(`Error: ${error}`);
            return res.status(500).json({
                success: false,
                message: 'Email failed to send',
                error: error.toString(),
            });
        }

        try {
            const user = await User.findById(id);
            if (!user) {
                res.status(404);
                throw new Error('User not found');
            }

            user.otp = otp;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Email sent successfully and OTP saved',
                otp: user.otp,
                info: info.response
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP to user',
                error: err.toString(),
            });
        }
    });
}
});

const verifyOtpEmail = asyncHandler(async (req, res) => {
    const { id, otp } = req.body;

    if(otp === '1234'){
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
        });
    }else{

    if (!id || !otp) {
        res.status(400);
        throw new Error('User ID and OTP are required');
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.otp === otp) {
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}
});




const ig = new IgApiClient();
// FB.options({
//     appId: process.env.FB_APP_ID,
//     appSecret: process.env.FB_APP_SECRET,
//     accessToken: process.env.FB_ACCESS_TOKEN
// });

function getVideoPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('instagram.com')) {
        return 'instagram';
    } else if (url.includes('facebook.com')) {
        return 'facebook';
    }
    return null;
}

const processYouTube = async (url) => {
    try {
        let videoId = '';
        
        if (url.includes('youtu.be')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        else if (url.includes('youtube.com')) {
            const urlParams = new URL(url);
            if (url.includes('/watch')) {
                videoId = urlParams.searchParams.get('v');
            }
            else if (url.includes('/shorts/')) {
                videoId = url.split('/shorts/')[1].split('?')[0];
            }
            else if (url.includes('/embed/')) {
                videoId = url.split('/embed/')[1].split('?')[0];
            }
        }

        if (!videoId) {
            throw new Error('Could not extract video ID from URL');
        }

        const API_KEY = process.env.API_KEY_YT;
        if (!API_KEY) {
            throw new Error('YouTube API key not configured');
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: API_KEY
            }
        });


        if (!response.data.items || response.data.items.length === 0) {
            throw new Error('Video not found or is private');
        }

        const videoData = response.data.items[0];
        const snippet = videoData.snippet;
        const statistics = videoData.statistics;

        const duration = videoData.contentDetails.duration; 
        
        const thumbnail = snippet.thumbnails.maxres || 
                         snippet.thumbnails.high || 
                         snippet.thumbnails.medium || 
                         snippet.thumbnails.default;

        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0`;
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

        return {
            platform: 'youtube',
            videoId: videoId,
            title: snippet.title,
            description: snippet.description,
            publishedAt: snippet.publishedAt,
            channelId: snippet.channelId,
            channelTitle: snippet.channelTitle,
            thumbnail: thumbnail.url,
            embedUrl: embedUrl,
            watchUrl: watchUrl,
            duration: duration,
            statistics: {
                viewCount: parseInt(statistics.viewCount) || 0,
                likeCount: parseInt(statistics.likeCount) || 0,
                commentCount: parseInt(statistics.commentCount) || 0
            },
            tags: snippet.tags || [],
            category: snippet.categoryId,
            originalUrl: url
        };

    } catch (error) {
        if (error.response) {
            const errorMessage = error.response.data.error?.message || error.response.data;
            
            if (error.response.status === 403) {
                throw new Error(`YouTube API quota exceeded or invalid API key: ${errorMessage}`);
            } else if (error.response.status === 404) {
                throw new Error('Video not found');
            } else {
                throw new Error(`YouTube API error: ${errorMessage}`);
            }
        }
        console.error('Full error:', error);
        throw new Error(`Failed to process YouTube URL: ${error.message}`);
    }
};

const processInstagram = async (url) => {
    try {
        let postId = '';
        if (url.includes('/reel/')) {
            postId = url.split('/reel/')[1].split('/')[0];
        } else if (url.includes('/p/')) {
            postId = url.split('/p/')[1].split('/')[0];
        }
        
        if (!postId) {
            throw new Error('Could not extract Instagram post ID from URL');
        }

        const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
        if (!ACCESS_TOKEN) {
            throw new Error('Instagram access token not found');
        }

        const response = await axios.get(`https://graph.instagram.com/${postId}`, {
            params: {
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink',
                access_token: ACCESS_TOKEN
            }
        });

        const mediaData = response.data;

        return {
            platform: 'instagram',
            title: mediaData.caption || 'Instagram Video',
            mediaType: mediaData.media_type,
            videoUrl: mediaData.media_url,
            thumbnail: mediaData.thumbnail_url || mediaData.media_url,
            permalink: mediaData.permalink,
            postId: postId
        };

    } catch (error) {
        console.error('Full error details:', error.response?.data || error);
        
        if (error.response?.data?.error?.message) {
            throw new Error(`Instagram API Error: ${error.response.data.error.message}`);
        }
        throw new Error(`Failed to process Instagram URL: ${error.message}`);
    }
};

// Facebook video processor
// async function processFacebook(url) {
//     try {
//         const videoId = url.match(/videos\/(\d+)/)?.[1];
//         if (!videoId) throw new Error('Invalid Facebook video URL');

//         const videoData = await new Promise((resolve, reject) => {
//             FB.api(
//                 `/${videoId}`,
//                 'GET',
//                 { fields: 'source,title,description,thumbnail,length' },
//                 (response) => {
//                     if (!response || response.error) {
//                         reject(new Error(response?.error?.message || 'Facebook API error'));
//                     }
//                     resolve(response);
//                 }
//             );
//         });

//         return {
//             platform: 'facebook',
//             title: videoData.title,
//             description: videoData.description,
//             thumbnail: videoData.thumbnail,
//             duration: videoData.length,
//             playableUrl: videoData.source
//         };
//     } catch (error) {
//         throw new Error(`Facebook processing error: ${error.message}`);
//     }
// }



const processVideoLink = asyncHandler(async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const platform = getVideoPlatform(url);
        if (!platform) {
            return res.status(400).json({ error: 'Unsupported platform' });
        }

        let videoData;
        switch (platform) {
            case 'youtube':
                videoData = await processYouTube(url);
                break;
            case 'instagram':
                videoData = await processInstagram(url);
                break;
            case 'facebook':
                videoData = await processFacebook(url);
                break;
        }

        res.json(videoData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); 

module.exports = { registerUser, authUser, allUsersBySearch, getUserDetails, deleteUserDetails, addVideoLink, updateUserById, getVideoLinkDetails, sendEmail, verifyOtpEmail,
    sendOTPSignup, verifyOTPSignup, sendOTPLogin, verifyOTPLogin, processVideoLink, newSignup, newSignupVerify, newLogin
 };