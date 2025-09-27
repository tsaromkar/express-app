const express = require('express');
const { COLLECTIONS } = require('../../utils/constants');
const { generateTokens } = require('./user.utils');
const { db } = require('../../utils/firebase');

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
        console.log(error)
        res.status(500).json({
            success: false,
            data: null,
            message: "Failed to login",
            error: error.message
        });
    }
})

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
