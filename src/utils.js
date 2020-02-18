const firebaseAdmin = require('firebase-admin');

const serviceAccount = require('./serviceKey.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://roommate-93dcd.firebaseio.com',
});

function authenticate(context) {
  /* tried this but didn't work for now fuck it will do later */

  /*
  const authorization = await context.request.get('Authorization');
  console.log(authorization);

  const mode = context.request.get('mode');
  // Requests from playground
  if (mode === 'dev') {
    return new Promise((resolve, reject) => {
      resolve({ uid: 'tT8tv8UXt2MSJiXoO5GoWFBfU0v2' });
    });
  }
  // Requests from succesful login
  let token = '';
  if (authorization) {
    token = authorization.replace('Bearer ', '');
  }
  return firebaseAdmin.auth().verifyIdToken(token);
  */

  /* this is the 'fake' auth check */

  // tT8tv8UXt2MSJiXoO5GoWFBfU0v2
  return new Promise((resolve, reject) => {
    resolve({ uid: 'tT8tv8UXt2MSJiXoO5GoWFBfU0v2' });
  });
}

module.exports = { authenticate };
