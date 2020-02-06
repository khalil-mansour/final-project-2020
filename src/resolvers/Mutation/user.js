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
};

module.exports = { userMutations };
