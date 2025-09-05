const { refreshToken } = require('firebase-admin/app');
const { COLLECTIONS, CONSTANTS } = require('./constants');
const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
    const payload = {
        name: data.name,
        email: data.email
    };
    return jwt.sign(payload, CONSTANTS.secretKey, { expiresIn: '1h' });
}

const generateRefreshToken = (data) => {
    const payload = {
        email: data.email
    };
    return jwt.sign(payload, CONSTANTS.secretKey, { expiresIn: '7d' });
}

const generateTokens = (data) => {
    return [generateAccessToken(data), generateRefreshToken(data)];
}

const addUser = async (db, data, res) => {
    try {
        const docRef = await db.collection(COLLECTIONS.Users).add({ ...data });
        let tokens = [];
        if (docRef.id) {
            tokens = generateTokens(data);
            console.log("🚀 ~ addUser ~ tokens:", tokens)
        }
        res.
            status(200).
            json({ data: { id: docRef.id, accessToken: tokens[0], refreshToken: tokens[1] }, message: 'User added successfully' });
    } catch (e) {
        throw e;
    }
}

module.exports = { addUser, generateTokens }