const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
     status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
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
    country: {
        type: String
    },
    state: {
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
    dateOfBirth:{
        type: Date
    },
    gender:{
        type: String
    },
    relationshipStatus:{
        type: String
    },
    language:{
        type: String
    },
    preferredContactMethod:{
        type: String
    },
    favoriteDanceStyle:{
        type: String
    },
    skillLevel:{
        type: String
    },
    profileImage:{
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    otp: {
        type: String,
        required: false,
    },
    videoLinks: [{
        link: {
            type: String,
        },
        count: {
            type: Number,
            default: 1
        },
        date:{
            type: Date,
        }
    }]
},
{
    timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;