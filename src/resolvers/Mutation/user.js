const userMutations = {
  signUp: (root, args, context) => context.prisma.createUser({
    userId: args.input.userId,
    name: args.input.name,
    lastName: args.input.lastName,
    email: args.input.email,
  }),

  assignTypeToUser: (root, args, context) => context.prisma.updateUser({
    id: args.input.id,
    type: args.input.type,
  }),

  updateUser: (root, args, context) => context.prisma.updateUser({
    data: {
      userId: args.input.userId,
      name: args.input.name,
      lastName: args.input.lastName,
      email: args.input.email,
    },
    where: {
      id: args.input.id,
    },
  }),
};

module.exports = { userMutations };
