const express = require('express');
const { addProducts } = require('./products.utils');
const db = require('../../utils/firebase');
const router = express.Router();

// GET /get-products?pageSize=5&lastVisible=abc123
router.get('/get-products', async (req, res) => {
    try {
        const pageSize = parseInt(req.query.pageSize) || 10;
        const lastVisible = req.query.lastVisible; // doc ID for pagination cursor

        let query = db.collection('products').orderBy('type').limit(pageSize);

        if (lastVisible) {
            // Get the document snapshot for the cursor
            const lastDoc = await db.collection('products').doc(lastVisible).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.json({ products: [], lastVisible: null });
        }

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // The last document in this page
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1].id;

        res.json({
            products,
            lastVisible: newLastVisible
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/add-products', async (req, res) => {
    const data = req.body;
    try {
        addProducts(data, res);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;
