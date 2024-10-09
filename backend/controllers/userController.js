const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
    const { name, mobileCode, mobile, city, email, loginType } = req.body

    if (!loginType) {
        res.status(400)
        throw new Error("Error In Login Type Not found")
    }

    if (loginType === "normal") {
        if (!name || !mobile || !city || !email) {
            res.status(400)
            throw new Error("Please Enter all the Feilds")
        } else if (!mobileCode) {
            res.status(400)
            throw new Error("Error In Mobile Code Not found")
        }
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

// const authUser = asyncHandler(async (req, res) => {
//     const { mobileCode, mobile, loginType } = req.body;
//     const user = await User.findOne({ mobile });

//     if (user && mobileCode === user.mobileCode) {
//         const otp = Math.floor(1000 + Math.random() * 9000);
//         res.json({
//             _id: user._id,
//             name: user.name,
//             mobile: user.mobile,
//             city: user.city,
//             email: user.email,
//             token: generateToken(user._id),
//             otp: otp,
//         });
//     } else {
//         res.status(401);
//         throw new Error("Invalid mobile or country code");
//     }
// });

const authUser = asyncHandler(async (req, res) => {
    const { mobileCode, mobile, loginType, name, email, photoURL,uid } = req.body;

    if (loginType && loginType === 'google') {
        console.log("enter")
        let user = await User.findOne({ email });
        console.log(user)

        if (!user) {
            user = await User.create({
                name,
                uid,
                email,
                photoURL,
                loginType,
                lastLogin: new Date()
            });
            console.log(user);
        } else {
            user.lastLogin = new Date();
            if (photoURL) user.photoURL = photoURL;
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            photoURL: user.photoURL,
            loginType: user.loginType,
            token: generateToken(user._id)
        });
        
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

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {}
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)

})

module.exports = { registerUser, authUser, allUsers }