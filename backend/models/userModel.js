const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    password: {
        type: String
    },
    occupation:{
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
        type: String
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
    loginDevice:{
        type: String
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

userSchema.methods.matchPasswords = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log({ enteredPassword, hashedPassword: this.password, isMatch });
    return isMatch;
}

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
const User = mongoose.model('User', userSchema);

module.exports = User