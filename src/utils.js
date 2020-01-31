var firebaseAdmin = require('firebase-admin');

var serviceAccount = require('./serviceKey.json');

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://roommate-93dcd.firebaseio.com"
});

function authenticate(context) {
    const authorization = context.request.get('Authorization')
    let token = '';
    if (authorization) {
        token = authorization.replace('Bearer ', '')
    }
    return firebaseAdmin.auth().verifyIdToken(token)
}

module.exports = {
    authenticate
}