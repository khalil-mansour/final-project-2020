const { inv } = require('../Invitation');

const invitationMutations = {
  createInvitation: (root, args, context) => context.prisma.createInvitation({
    from: { connect: { id: args.input.from } },
    group: { connect: { id: args.input.group } },
    link: args.input.link,
    expiredAt: args.input.expiredAt,
  }),

  acceptInvitation: async (root, args, context) => {
    const group = await context.prisma.invitation({ id: args.input.invitation }).group();
    const from = await context.prisma.invitation({ id: args.input.invitation }).from();

    /* Check if user already in group */

    return context.prisma.createUserGroup({
      /* Should be context.user, not the one who sent the invite */
      user: { connect: { id: from.id } },
      group: { connect: { id: group.id } },
      join_at: 'datetime.now()',
    });
  },
};

module.exports = { invitationMutations };
