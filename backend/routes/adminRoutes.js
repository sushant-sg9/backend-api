const express = require('express');
const { adminLogin, getAllUsers, getPopularity, getUserById, changeAdminPassword } = require('../controllers/adminController');
const  {adminProtect}  = require('../middleware/authController')

const router = express.Router();

router.route('/login').post(adminLogin);
router.route('/getAllUser').get(adminProtect,getAllUsers);
router.route('/getPopularity').get(adminProtect,getPopularity);
router.route('/getUserById/:id').get(adminProtect, getUserById);
router.route('/change-password').post(adminProtect, changeAdminPassword);


module.exports = router;

