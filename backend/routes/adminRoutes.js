const express = require('express');
const { adminLogin, getAllUsers, getPopularity, getUserById, getMultipleUserInfo, changeAdminPassword, addDesignation, getAllDesignations, addVideo, getAllVideos } = require('../controllers/adminController');
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
router.route('/addVideo').post(addVideo);
router.route('/getAllVideo').get(getAllVideos);


module.exports = router;

