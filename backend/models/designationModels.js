const mongoose = require("mongoose");

const designationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

const Designation = mongoose.model("Designation", designationSchema);
module.exports = Designation;