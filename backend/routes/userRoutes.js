const express = require('express')
const { registerUser, authUser, allUsersBySearch, getUserDetails, deleteUserDetails, addVideoLink} = require('../controllers/userController')
const  {protect}  = require('../middleware/authController')

const router = express.Router()

router.route('/').post(registerUser).get(protect,allUsersBySearch)
router.route('/login').post(authUser)
router.route('/getDetailsByID').post(protect,getUserDetails)
router.route('/deleteUser').post(protect,deleteUserDetails)
router.route('/addVideoLink').post(protect,addVideoLink)

module.exports = router