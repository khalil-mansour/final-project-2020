const { authenticate } = require('../../utils.js');

const invitationMutation = {
  createInvitation: async (root, args, context) => authenticate(context)
    .then(async (res) => {
      // TODO : Check if user creating the invite is already in the group !

      /* Fetch user from database */
      const user = await context.prisma.user({ userId: res.uid });
      return context.prisma.createInvitation({
        from: { connect: { id: user.id } },
        group: { connect: { id: args.input.group } },
        link: args.input.link,
        expiredAt: args.input.expiredAt,
      }).catch((error) => {
        console.log(error);
        throw new Error('invitation / could not create a new invitation.');
      });
    }),

  acceptInvitation: async (root, args, context) => {
    /* Validate user */
    authenticate(context).then(async (res) => {
      const group = await context.prisma.invitation({ id: args.input.invitation }).group();
      const user = await context.prisma.user({ userId: res.uid });
      const userGroupArray = await context.prisma.userGroups({
        where: {
          user: {
            id: user.id,
          },
          group: {
            id: group.id,
          },
        },
      });

      /* Check if already in group before adding */
      if (userGroupArray.length === 0) {
        return context.prisma.createUserGroup({
          user: { connect: { id: user.id } },
          group: { connect: { id: group.id } },
          join_at: 'datetime.now()',
        });
      }
      console.log('User already joined the group');
      throw new Error('invitation / user already in group.');
    });
  },
};

module.exports = { invitationMutation };
