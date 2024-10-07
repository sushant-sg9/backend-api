const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");

const registerUser =  asyncHandler (async(req,res) => {
    const { name, mobileCode, mobile, city} =req.body

    if(!name || !mobile || !city){
        res.status(400)
        throw new Error("Please Enter all the Feilds")
    }else if(!mobileCode){
        res.status(400)
        throw new Error("Error In Mobile Code Not found")
    }
    const userExists = await User.findOne({
        $or: [
            { mobile: req.body.mobile }
        ]
    });
    
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({name, mobileCode, mobile, city})
    if(user){
        res.status(201).json({
            message: "Registration successful",
            _id: user._id,
            name: user.name,
            mobileCode: user.mobileCode,
            mobile: user.mobile,
            city: user.city,
            token: generateToken(user._id),
        })
    }else{
        res.status(400)
        throw new Error("Failed to Create the User")
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { mobileCode, mobile } = req.body; 
    const user = await User.findOne({ mobile });

    if (user && mobileCode === mobile) {
        const otp = Math.floor(1000 + Math.random() * 9000); 
        res.json({
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            city: user.city,
            token: generateToken(user._id),
            otp: otp, 
        });
    } else {
        res.status(401);
        throw new Error("Invalid mobile or country code"); 
    }
});

const allUsers = asyncHandler (async(req,res) => {
    const keyword = req.query.search?{
        $or: [
            {name: {$regex: req.query.search, $options: "i"}},
            {email: {$regex: req.query.search, $options: "i"}},
        ],
    }:{}
    const users = await User.find(keyword).find({_id: {$ne: req.user._id}})
    res.send(users)
  
}) 

module.exports = {registerUser, authUser, allUsers}