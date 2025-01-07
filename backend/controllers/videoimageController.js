const asyncHandler = require("express-async-handler");
const Media = require("../models/videoImageModels");

const createMedia = asyncHandler(async (req, res) => {
    const mediaData = req.body;

    const isArray = Array.isArray(mediaData);
    
    try {
        let result;
        
        if (isArray) {
            mediaData.forEach(entry => {
                if (!entry.videoUrl || !entry.imageUrl) {
                    throw new Error('Both videoUrl and imageUrl are required for each entry');
                }
            });
            
            const formattedData = mediaData.map(entry => ({
                videourl: entry.videoUrl,
                imageurl: entry.imageUrl
            }));
            
            result = await Media.insertMany(formattedData);
        } else {
            if (!mediaData.videoUrl || !mediaData.imageUrl) {
                res.status(400);
                throw new Error('Both videoUrl and imageUrl are required');
            }
            
            result = await Media.create({
                videourl: mediaData.videoUrl,
                imageurl: mediaData.imageUrl
            });
        }

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const getAllMedia = asyncHandler(async (req, res) => {
    try {
        const media = await Media.find({});
        
        const formattedMedia = media.map(item => ({
            videoUrl: item.videourl,
            imageUrl: item.imageurl
        }));

        res.status(200).json({
            success: true,
            count: formattedMedia.length,
            data: formattedMedia
        });
    } catch (error) {
        res.status(500);
        throw new Error('Error fetching media data');
    }
});

module.exports = {
    createMedia,
    getAllMedia
};