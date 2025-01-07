const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  videourl: {
    type: String,
    required: true,
    trim: true
  },
  imageurl: {
    type: String,
    required: true,
    trim: true
  },
});


const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;