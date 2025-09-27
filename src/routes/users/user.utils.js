const { CONSTANTS } = require('../../utils/constants');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
    // console.log("🚀 ~ authenticateToken ~ token:", token)

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
    authenticateToken,
    generateAccessToken,
    generateRefreshToken,
    generateTokens
}