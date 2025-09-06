const express = require('express')
// const bodyParser = require('body-parser'); // Import body-parser
const usersRoutes = require('./src/routes/users/users.routes');
const productsRoutes = require('./src/routes/products/products.routes');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
// app.use(bodyParser.json());
// Or, if you prefer Express's built-in parser:
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api', usersRoutes);
app.use('/api', productsRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
