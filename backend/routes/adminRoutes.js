const express = require('express');
const { adminLogin, getAllUsers, getPopularity, getUserById, getMultipleUserInfo, changeAdminPassword, addDesignation, getAllDesignations, addVideo, getAllVideos, deleteVideo,updateVideo } = require('../controllers/adminController');
const  {adminProtect}  = require('../middleware/authController')

const router = express.Router();

router.route('/login').post(adminLogin);
router.route('/getAllUser').get(adminProtect,getAllUsers);
router.route('/getPopularity').get(adminProtect,getPopularity);
router.route('/getUserById/:id').get(adminProtect, getUserById);
router.route('/getMultipleUserInfo/:userIds').get(adminProtect, getMultipleUserInfo);
router.route('/change-password').post(adminProtect, changeAdminPassword);
router.route('/addDesignation').post(addDesignation);
router.route('/getAllDesignations').get(adminProtect,getAllDesignations);
router.route('/addVideo').post(adminProtect,addVideo);
router.route('/getAllVideo').get(adminProtect,getAllVideos);
router.route("/deleteVideo").post(adminProtect,deleteVideo);
router.route("/updateVideo").post(adminProtect,updateVideo);



module.exports = router;

