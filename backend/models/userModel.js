const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobileCode: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
},
{
    timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User