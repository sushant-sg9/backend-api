const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    mobileCode: {
        type: String,
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    city: {
        type: String
    },
    loginType: {
        type: String,
    },
    photoURL: {
        type: String
    },
    uid: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    videoLinks: [{
        link: {
            type: String,
        },
        count: {
            type: Number,
            default: 1
        }
    }]
},
{
    timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;