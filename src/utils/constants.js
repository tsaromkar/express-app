require('dotenv').config();

const COLLECTIONS = {
    "Users": "users",
    "Products": "products",
    "ProductTypes": "product-types",
    "TopDeals": "top-deals"
}

const CONSTANTS = {
    SECRET_KEY: "my-secret-key"
}

const ENV = {
    BASE_URL: process.env.BASE_URL,
    PORT: process.env.PORT,
    HOST: `${process.env.BASE_URL}:${process.env.PORT}`,
}

module.exports = { COLLECTIONS, CONSTANTS, ENV }