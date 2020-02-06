const userMutations = {
  signUp: (root, args, context) => context.prisma.createUser({
    userId: args.userId,
    name: args.name,
    lastName: args.lastName,
    email: args.email,
  }),

  assignTypeToUser: (root, args, context) => context.prisma.updateUser({
    id: args.input.id,
    type: args.input.type,
  }),
};

module.exports = { userMutations };
