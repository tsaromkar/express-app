const express = require('express');
const { addProducts } = require('./products.utils');
const db = require('../../utils/firebase');
const { COLLECTIONS } = require('../../utils/constants');
const router = express.Router();

// GET /get-products?pageSize=5&lastVisible=abc123
router.get('/get-products', async (req, res) => {
    try {
        const { pageSize = 10, lastVisible = null, search = '', type = '' } = req.query;

        let query = db.collection('products').orderBy('name').limit(Number(pageSize));

        if (type) {
            const types = type.split(','); // "laptop,mobile" -> ["laptop", "mobile"]
            query = query.where('type', 'in', types);
        }

        if (search) {
            query = query
                .where('name', '>=', search)
                .where('name', '<=', search + '\uf8ff');
        }

        if (lastVisible) {
            // Get the document snapshot for the cursor
            const lastDoc = await db.collection(COLLECTIONS.Products).doc(lastVisible).get();
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
            data: {
                products,
                lastVisible: newLastVisible
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/get-product-types', async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTIONS.ProductTypes).orderBy("type").get();
        if (snapshot.docs.length) {
            const types = snapshot.docs.map(doc => doc.data().type);
            res.json({ data: { types } });
        } else res.json({ message: "No product types found" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

router.get('/get-top-deals', async (req, res) => {
    try {
        let snapshot = await db.collection('top-deals').orderBy('name').get();

        if (snapshot.empty) {
            return res.json({ topDeals: [] });
        }

        const topDeals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            data: {
                topDeals
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/add-products', async (req, res) => {
    const data = req.body;
    try {
        addProducts(data, res, COLLECTIONS.Products);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

router.post('/add-top-deals', async (req, res) => {
    const data = req.body;
    try {
        addProducts(data, res, COLLECTIONS.TopDeals);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;
