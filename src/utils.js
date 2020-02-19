const firebaseAdmin = require('firebase-admin');

const serviceAccount = require('./serviceKey.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://roommate-93dcd.firebaseio.com',
});

function authenticate(context) {
  // tT8tv8UXt2MSJiXoO5GoWFBfU0v2
  // user1
  // user2
  return new Promise((resolve, reject) => {
    resolve({ firebaseId: 'tT8tv8UXt2MSJiXoO5GoWFBfU0v2' });
  });
}

module.exports = { authenticate };
