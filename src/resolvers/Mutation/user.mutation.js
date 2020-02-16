const { authenticate } = require('../../utils.js');

const userMutation = {
  signUp: (root, args, context) => authenticate(context)
    .then(() => context.prisma.createUser({
      userId: args.userId,
      name: args.name,
      lastName: args.lastName,
      email: args.email,
      avatar: args.avatar,
    }))
    .catch((error) => error),
};

module.exports = { userMutation };
