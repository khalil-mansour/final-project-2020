const { authenticate } = require('../../utils.js');

const userMutation = {
  signUp: async (root, args, context) => authenticate(context)
    .then((res) => context.prisma.createUser({
      name: args.input.name,
      userId: res.uid,
      lastName: args.input.lastName,
      email: args.input.email,
    }))
    .catch((error) => {
      console.error(error);
      return error;
    }),

  assignTypeToUser: (root, args, context) => context.prisma.updateUser({
    id: args.input.id,
    type: args.input.type,
  }),

  updateUser: (root, args, context) => authenticate(context)
    .then((res) => context.prisma.updateUser({
      data: {
        name: args.input.name,
        lastName: args.input.lastName,
        email: args.input.email,
      },
      where: {
        id: args.input.id,
      },
    }))
    .catch((error) => {
      console.error(error);
      return error;
    }),
};

module.exports = { userMutation };
