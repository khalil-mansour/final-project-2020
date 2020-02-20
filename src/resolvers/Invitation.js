const Invitation = {

  /* GET invitation sender */
  from: (parent, args, context) => context.prisma.invitation({ id: parent.id }).from(),

  /* GET invitation group */
  group: (parent, args, context) => context.prisma.invitation({ id: parent.id }).group(),

};

module.exports = { Invitation };
