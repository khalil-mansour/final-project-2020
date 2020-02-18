const { authenticate } = require('../../utils.js');

const groupMutation = {
  createGroup: async (root, args, context) => {
    const res = await authenticate(context);
    return await context.prisma.createGroup({
      name: args.input.name,
      address: { connect: { id: args.input.address } },
      admin: { connect: { id: args.input.admin } },
    })
    .catch((error) => {
      throw new Error(error.message);
    })
  },

  updateGroupName: async (root, args, context) =>  {
    const res = await authenticate(context);
    return await context.prisma.updateGroup({
      data: {
        name: args.input.name,
      },
      where: {
        id: args.input.group,
      },
    })
    .catch((error) => {
      throw new Error(error.message);
    })
  },

  leaveGroup: async (parent, args, context) => {
    const res = await authenticate(context);
    const user = await context.prisma.user({ userId: res.uid });
    const userGroup = await context.prisma.userGroups({
      where: {
        user: {
          id: user.id,
        },
        group: {
          id: args.input.group,
        },
      },
    });
    const userGroupId = userGroup[0].id;
    /* TODO: Fix return object (Mutation works, reponse has non-nullable error) */
    return context.prisma.deleteUserGroup({ id: userGroupId });
    
  },

  removeUserFromGroup: (parent, args, context) => {
    context.prisma.updateGroup({
      /* TODO: Refactor */
    });
  },
};

module.exports = { groupMutation };
