const { COLLECTIONS } = require('../../utils/constants');
const db = require('../../utils/firebase');

const addProducts = async (data, res) => {
    try {
        const batch = db.batch();

        data.forEach((product) => {
            const docRef = db.collection(COLLECTIONS.Products).doc(); // auto-generated ID
            batch.set(docRef, product);
        });

        await batch.commit();

        res.
            status(200).
            json({ message: `Product${data.length > 1 ? 's' : ''} added successfully` });
    } catch (e) {
        throw e;
    }
}

module.exports = { addProducts }