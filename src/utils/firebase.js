var admin = require("firebase-admin");
var serviceAccount = require("../../express-app-47864-firebase-adminsdk-fbsvc-ee906dec5f.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
module.exports = db;