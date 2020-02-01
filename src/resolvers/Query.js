const { authenticate } = require('../utils.js');

const Query = {
  users: (root, args, context) => context.prisma.users(),
  login: (root, args, context) => authenticate(context)
    .then((validatedUser) => {
      if (args.userId && validatedUser.uid) {
        // If the provided uid matches with the validated token id
        if (args.userId === validatedUser.uid) {
          // @todo
          // Validate that a user exists in the database with this uid
          return true;
        }
      }
      // Else, something wrong happened, return some kind of error ?
      throw new Error('auth/invalid_uid');
    })
    .catch((error) => error),
};

module.exports = { Query };
