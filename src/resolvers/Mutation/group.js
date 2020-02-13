const { authenticate } = require('../../utils.js');

const groupMutation = {
  createGroup: (root, args, context) => authenticate(context)
    .then((res) => context.prisma.createGroup({
      name: args.input.name,
      address: { connect: { id: args.input.address } },
      admin: { connect: { id: args.input.admin } },
    }))
    .catch((error) => {
      console.error(error);
      return error;
    }),

  updateGroupName: (root, args, context) => authenticate(context)
    .then((res) => context.prisma.updateGroup({
      data: {
        name: args.input.name,
      },
      where: {
        id: args.input.group,
      },
    }))
    .catch((error) => {
      console.error(error);
      return error;
    }),

  leaveGroup: (parent, args, context) => authenticate(context)
    .then(async (res) => {
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
      console.log(userGroupId);

      /* TODO: Fix return object (Mutation works, reponse has non-nullable error) */
      return context.prisma.deleteUserGroup({ id: userGroupId });
    }),

  removeUserFromGroup: (parent, args, context) => {
    context.prisma.updateGroup({
      /* TODO: Refactor */
    });
  },
};

module.exports = { groupMutation };
