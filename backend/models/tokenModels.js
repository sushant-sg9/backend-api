const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    apiToken: {
        type: String,
    }
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;