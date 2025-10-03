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

    jwt.verify(token, CONSTANTS.SECRET_KEY, (err) => {
        if (err) {
            return res.status(403).json({
                expired: "accessToken",
                success: false,
                data: null,
                message: "Invalid or expired access token"
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

    jwt.verify(token, CONSTANTS.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({
                expired: "refreshToken",
                success: false,
                data: null,
                message: "Invalid or expired refresh token"
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
    return jwt.sign(payload, CONSTANTS.SECRET_KEY, { expiresIn: '2m' });
}

const generateRefreshToken = (data) => {
    const payload = {
        email: data.email
    };
    return jwt.sign(payload, CONSTANTS.SECRET_KEY, { expiresIn: '5m' });
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