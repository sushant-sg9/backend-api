const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const USer = require('../models/userModel.js')
const Admin = require('../models/adminModels.js')

const protect = asyncHandler(async(req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await USer.findById(decoded.id).select('-password')
            next()
        }catch(error){
            console.error(error)
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    }
    if(!token){
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

const adminProtect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const admin = await Admin.findById(decoded.id).select('-password');
            if (!admin || admin.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized as admin');
            }

            req.admin = admin;
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = {protect, adminProtect}