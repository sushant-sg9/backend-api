const express = require('express');
const router = express.Router();
const { createMedia, getAllMedia } = require('../controllers/videoimageController');

router.route('/')
    .post(createMedia)
    .get(getAllMedia);

module.exports = router;