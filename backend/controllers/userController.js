const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../Config/generateToken");

const registerUser =  asyncHandler (async(req,res) => {
    const { name, email, mobile, password} =req.body

    if(!name || !email || !mobile || !password){
        res.status(400)
        throw new Error("Please Enter all the Feilds")
    }       
    const userExists = await User.findOne({
        $or: [
            { email: req.body.email },
            { mobile: req.body.mobile }
        ]
    });
    
    if (userExists) {
        res.status(400);
        throw new Error("User already exists with this email or mobile");
    }
    const user = await User.create({name, email, mobile, password})
    if(user){
        res.status(201).json({
            message: "Registration successful",
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            token: generateToken(user._id),
        })
    }else{
        res.status(400)
        throw new Error("Failed to Create the User")
    }
})

const authUser = asyncHandler(async (req, res) =>{
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(user && (await user.matchPasswords(password))){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            token: generateToken(user._id),
        })
    }else{
        res.status(401)
        throw new Error("Invalid email or password")
    }

})

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