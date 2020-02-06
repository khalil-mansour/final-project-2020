const groupMutations = {
  createGroup: (root, args, context) => context.prisma.createGroup({
    name: args.input.name,
    address: { connect: { id: args.input.address } },
    admin: { connect: { id: args.input.admin } },
    members: { connect: { id: args.input.admin } },
  }),
};

module.exports = { groupMutations };
