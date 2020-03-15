const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceKey.json');
const config = require('./config.json');

require('dotenv').config();

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://roommate-93dcd.firebaseio.com',
});
console.log(process.env.DEV_FLAG);
function authenticate(context) {
  if (process.env.DEV_FLAG) {
    return new Promise((resolve) => {
      resolve({ uid: config.simulated_firebase_id });
    });
  }
  const authorization = context.request.get('Authorization');
  let token = '';
  if (authorization) {
    token = authorization.replace('Bearer ', '');
  }
  return firebaseAdmin.auth().verifyIdToken(token);
}

module.exports = { authenticate };
