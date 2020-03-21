const Invitation = {

  /* GET invitation group */
  group: (parent, args, context) => context.prisma.invitation({ id: parent.id }).group(),

  role: (parent, args, context) => context.prisma.invitation({ id: parent.id }).role(),
};

module.exports = { Invitation };
