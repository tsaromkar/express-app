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

        const response = await messaging.send(message);
        res.status(200).send({
            success: true,
            data: { response },
            message: "Notification"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            data: null,
            message: "Error sending notification",
            error: error.message
        });
    }
});

module.exports = router;
