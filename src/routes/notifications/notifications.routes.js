const express = require('express');
const { messaging } = require('../../utils/firebase');

const router = express.Router();

router.post('/get-notification', async (req, res) => {
    const { token } = req.body;

    try {
        const message = {
            notification: {
                title: "ReactNativeApp",
                body: "Products Test",
            },
            data: {
                screen: "Products"
            },
            token,
        };
        console.log("🚀 ~ message:", message)

        const response = await messaging.send(message);
        console.log("🚀 ~ response:", response)
        res.send({ status: true, response });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
