const express = require('express');
const { adminLogin } = require('../controllers/adminController');
const router = express.Router();
const  {protect}  = require('../middleware/authController')


router.route('/login').post(adminLogin);

module.exports = router;