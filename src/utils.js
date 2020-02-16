const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./serviceKey.json');
require('dotenv').config();

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://roommate-93dcd.firebaseio.com',
});

function authenticate(context) {
  if (process.env.DEV_FLAG === 'true') {
    return new Promise((resolve) => {
      resolve({ uid: 'G4ZaG49WfabtVgzbUYnELosxlqL2' });
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
