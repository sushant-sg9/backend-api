const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;