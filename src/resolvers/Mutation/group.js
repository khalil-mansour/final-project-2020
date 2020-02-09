const groupMutations = {
  createGroup: (root, args, context) => context.prisma.createGroup({
    name: args.input.name,
    address: { connect: { id: args.input.address } },
    admin: { connect: { id: args.input.admin } },
    /* on creation, the admin is automatically a member of the group */
    members: { connect: { id: args.input.admin } },
  }),

  updateGroupName: (root, args, context) => context.prisma.updateGroupName({
    data: {
      name: args.input.name,
    },
    where: {
      groupId: args.input.groupId,
    },
  }),

  leaveGroup: (parent, args, context) => context.prisma.updateGroup({
    data: {
      members: {
        disconnect: { id: args.input.user },
      },
    },
    where: {
      id: args.input.group,
    },
  }),

  removeUserFromGroup: (parent, args, context) => {
    console.log(context.user);
    context.prisma.updateGroup({

    });
  },
};

module.exports = { groupMutations };
