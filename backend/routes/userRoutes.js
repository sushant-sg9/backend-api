const express = require('express')
const { registerUser, authUser, allUsersBySearch, getUserDetails, deleteUserDetails, addVideoLink, updateUserById, getVideoLinkDetails, sendEmail, verifyOtpEmail} = require('../controllers/userController')
const  {protect}  = require('../middleware/authController')
const { route } = require('express/lib/application')

const router = express.Router()

router.route('/').post(registerUser).get(protect,allUsersBySearch)
router.route('/login').post(authUser)
router.route('/getDetailsByID').post(protect,getUserDetails)
router.route('/deleteUser').post(protect,deleteUserDetails)
router.route('/addVideoLink').post(protect,addVideoLink)
router.route('/updateUserdeatils').post(protect,updateUserById)
router.route('/getVideoLinkDetails').post(protect,getVideoLinkDetails)
router.route('/sendEmail').post(protect,sendEmail)
router.route('/verifyOtpEmail').post(protect,verifyOtpEmail)

module.exports = router