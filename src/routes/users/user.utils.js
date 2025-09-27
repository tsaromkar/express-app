const { CONSTANTS } = require('../../utils/constants');
const jwt = require('jsonwebtoken');

const authenticateAccessToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            success: false,
            data: null,
            message: "Access token required"
        });
    }

    jwt.verify(token, CONSTANTS.secretKey, (err) => {
        if (err) {
            return res.status(403).json({
                success: false,
                data: null,
                message: "Invalid or expired token"
            });
        }
        next();
    });
};

const authenticateRefreshToken = (req, res, next) => {
    const data = req.body;
    const token = data.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            data: null,
            message: "Refresh token required"
        });
    }

    jwt.verify(token, CONSTANTS.secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                data: null,
                message: "Invalid or expired token"
            });
        }
        req.user = user;
        next();
    });
};

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

module.exports = {
    authenticateAccessToken,
    authenticateRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokens
}