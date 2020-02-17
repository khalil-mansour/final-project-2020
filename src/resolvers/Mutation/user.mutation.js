const { authenticate } = require('../../utils.js');

const userMutation = {
  signUp: (root, args, context) => authenticate(context)
    .then(() => context.prisma.createUser({
      userId: args.input.userId,
      name: args.input.name,
      lastName: args.input.lastName,
      email: args.input.email,
      avatar: args.input.avatar,
    }))
    .catch((error) => error),
};

module.exports = { userMutation };
