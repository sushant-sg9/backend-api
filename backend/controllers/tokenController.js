const asyncHandler = require("express-async-handler");
const Token = require("../models/tokenModels")



const generateRandomToken = () => {
    return "d70350515dmshe71f5886436d5a4p12b338jsn1bba2f2afce1"; 
};

const createToken = asyncHandler(async (req, res) => {
    const randomToken = generateRandomToken();

    const existingToken = await Token.findOne();

    if (existingToken) {
        existingToken.apiToken = randomToken;
        await existingToken.save();

        res.status(200).json({
            message: "Token updated successfully",
            token: existingToken.apiToken,
        });
    } else {
        const newToken = new Token({ apiToken: randomToken });
        await newToken.save();

        res.status(201).json({
            message: "Token created successfully",
            token: newToken.apiToken,
        });
    }
});

const getToken = asyncHandler(async (req, res) => {
    const token = await Token.findOne();

    if (!token) {
        return res.status(404).json({ message: "No token found" });
    }

    res.status(200).json({ token: token.apiToken });
});

module.exports = {
    createToken,
    getToken,
};