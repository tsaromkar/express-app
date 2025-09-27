const express = require('express');
const { COLLECTIONS, ENV } = require('../../utils/constants');
const { authenticateRefreshToken, generateAccessToken, generateTokens } = require('./user.utils');
const { db } = require('../../utils/firebase');
const axios = require('axios');

const router = express.Router();

const addUser = async (data, res) => {
    try {
        const docRef = await db.collection(COLLECTIONS.Users).add({ ...data });
        let tokens = [];
        if (docRef.id) {
            tokens = generateTokens(data);
        }
        res.status(200).json({
            success: true,
            data: { id: docRef.id, accessToken: tokens[0], refreshToken: tokens[1] },
            message: 'User added successfully'
        });
    } catch (e) {
        throw e;
    }
}

router.post('/signup', async (req, res) => {
    const data = req.body;

    try {
        const snapshot = await db.collection(COLLECTIONS.Users).get();
        if (snapshot.docs.length) {
            const user = snapshot.docs.find(doc => doc.data().email === data.email);
            if (user) {
                res.status(409).json({
                    success: false,
                    data: null,
                    message: 'User already exist'
                });
            } else {
                addUser(data, res);
            }
        } else {
            addUser(data, res);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: "Failed to add user",
            error: error.message
        });
    }
})

router.post('/login', async (req, res) => {
    const data = req.body;

    try {
        const snapshot = await db.collection(COLLECTIONS.Users).get();
        if (snapshot.docs.length) {
            const user = snapshot.docs.find(doc => doc.data().email === data.email);
            if (user) {
                let tokens = [];
                if (user.id) {
                    tokens = generateTokens(user.data());
                }
                res.status(200).json({
                    success: true,
                    data: { id: user.id, accessToken: tokens[0], refreshToken: tokens[1] },
                    message: 'Login Success'
                });
            } else {
                res.status(404).json({
                    success: false,
                    data: null,
                    message: "User doesn't exist"
                });
            }
        } else {
            res.status(404).json({
                success: false,
                data: null,
                message: "User doesn't exist"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: "Failed to login",
            error: error.message
        });
    }
})

router.post('/refresh', authenticateRefreshToken, async (req, res) => {
    const email = req.user.email;
    try {
        const postData = { email };
        const options = {
            headers: {
                'Content-Type': 'application/json',
            }
        }
        const response = await axios.post(`${ENV.HOST}/user-api/getUser`,
            postData,
            options
        );
        const { success } = response?.data || {};
        if (success) {
            const { data } = response.data;
            const { user: {
                name
            } } = data;
            const accessToken = generateAccessToken({
                name,
                email
            })
            res.status(200).json({
                success: true,
                data: { accessToken },
                message: "AccessToken renewed successfully",
            });
        } else {
            throw new Error("Failed to refresh access token");
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: "Failed to refresh tokens",
            error: error.message
        });
    }
})

router.post('/getUser', async (req, res) => {
    const data = req.body;
    try {
        const snapshot = await db.collection(COLLECTIONS.Users).where("email", "==", data.email).get();
        if (snapshot.empty) {
            res.status(404).json({
                success: false,
                message: "User doesn't exist"
            })
        }
        const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({
            success: true,
            data: { user: user[0] },
            message: "User found successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            message: "User found operation failed",
            error: error.message
        });
    }
});

// Example route to add data
// app.post('/addUser', async (req, res) => {
//     try {
//         const { name, email } = req.body;
//         const docRef = await db.collection("users").add({ name, email });
//         res.json({ id: docRef.id, message: 'User added successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Example route to read data
// app.get('/getUsers', async (req, res) => {
//     try {
//         const snapshot = await db.collection("users").get();
//         const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

module.exports = router;
