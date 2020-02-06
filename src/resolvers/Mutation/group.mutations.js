const groupMutations = {
  createGroup: (root, args, context) => context.prisma.createGroup({
    name: args.name,
    address: { connect: { id: args.addressId } },
    admin: { connect: { id: args.adminId } },
    members: args.membersId,
  }),
};

module.exports = { groupMutations };
