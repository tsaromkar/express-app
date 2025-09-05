const express = require('express')
const bodyParser = require('body-parser'); // Import body-parser
const app = express()
const port = 3000
// Middleware to parse JSON request bodies
app.use(bodyParser.json());
// Or, if you prefer Express's built-in parser:
// app.use(express.json());


var admin = require("firebase-admin");

var serviceAccount = require("./express-app-47864-firebase-adminsdk-fbsvc-ee906dec5f");
const { COLLECTIONS } = require('./constants');
const { addUser } = require('./utils');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/login', async (req, res) => {
    const data = req.body;

    try {
        const snapshot = await db.collection(COLLECTIONS.Users).get();
        if (snapshot.docs.length) {
            const user = snapshot.docs.find(doc => doc.data().email === data.email);
            if (user) {
                res.
                    status(400).
                    json({ message: 'User already exist' });
            } else {
                addUser(db, data, res);
            }
        } else {
            addUser(db, data, res);
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
})

// Example route to add data
app.post('/addUser', async (req, res) => {
    try {
        const { name, email } = req.body;
        const docRef = await db.collection("users").add({ name, email });
        res.json({ id: docRef.id, message: 'User added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example route to read data
app.get('/getUsers', async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
