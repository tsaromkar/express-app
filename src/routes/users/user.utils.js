const { COLLECTIONS, CONSTANTS } = require('../../utils/constants');
const jwt = require('jsonwebtoken');
const db = require('../../utils/firebase');

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

const addUser = async (data, res) => {
    try {
        const docRef = await db.collection(COLLECTIONS.Users).add({ ...data });
        let tokens = [];
        if (docRef.id) {
            tokens = generateTokens(data);
        }
        res.
            status(201).
            json({ data: { id: docRef.id, accessToken: tokens[0], refreshToken: tokens[1] }, message: 'User added successfully' });
    } catch (e) {
        throw e;
    }
}

module.exports = { addUser, generateTokens }