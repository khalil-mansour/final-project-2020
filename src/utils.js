const firebaseAdmin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const serviceAccount = require('./serviceKey.json');
const config = require('./config.json');

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://roommate-93dcd.firebaseio.com',
});

function authenticate(context) {
  if (process.env.DEV_FLAG === 'true') {
    return new Promise((resolve) => {
      resolve({ uid: config.simulated_firebase_id });
    });
  }

  let authorization;

  if (context.connection && context.connection.context) {
    authorization = context.connection.context.Authorization;
  } else {
    authorization = context.request.get('Authorization');
  }

  let token = '';
  if (authorization) {
    token = authorization.replace('Bearer ', '');
  }
  return firebaseAdmin.auth().verifyIdToken(token);
}
// Validate that every specified users belongs to the same group
const usersBelongsToGroup = async (context, userFirebaseIds, groupId) => {
  const validUserGroupBelongingsCount = await context.prisma.userGroupsConnection({
    where: {
      group: {
        id: groupId,
      },
      user: {
        firebaseId_in: userFirebaseIds,
      },
    },
  }).aggregate().count();

  return validUserGroupBelongingsCount === userFirebaseIds.length;
};

// Validate that a single user belongs to a group
const userBelongsToGroup = async (
  context,
  userFirebaseId,
  groupId,
) => usersBelongsToGroup(context, [userFirebaseId], groupId);

module.exports = { authenticate, userBelongsToGroup, usersBelongsToGroup };
