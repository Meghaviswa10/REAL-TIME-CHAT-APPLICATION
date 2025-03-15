const admin = require('firebase-admin');
const serviceAccount = require('./chat-app-7444b-firebase-adminsdk-fbsvc-0922db3644.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-app-7444b.firebaseio.com"
  });
}

const connectDB = () => {
  return admin.firestore();
};

const db = connectDB(); 

module.exports = db; 
