const { authenticate } = require('../utils.js');

const Query = {
  users: (root, args, context) => context.prisma.users(),
  login: (root, args, context) => authenticate(context)
    .then((validatedUser) => {
      if (args.userId && validatedUser.uid) {
        return context.prisma.$exists.user({ userId: args.userId });
      }
      console.log('Provided UID doesn\'t match with the bearer token');
      throw new Error('auth/invalid_uid');
    })
    .catch((error) => {
      console.error(error);
      return error;
    }),
};

module.exports = { Query };
