const express = require('express');
const { createToken, getToken,} = require("../controllers/tokenController")



const router = express.Router();

router.post("/createToken", createToken);
router.get('/getToken',getToken);


module.exports = router;