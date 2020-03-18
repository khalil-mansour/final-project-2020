const Group = {

  /* GET group address */
  address: (parent, args, context) => context.prisma.group({ id: parent.id }).address(),

  /* GET group admin */
  admin: (parent, args, context) => context.prisma.group({ id: parent.id }).admin(),

  /* GET group users */
  users: (parent, args, context) => context.prisma.group({ id: parent.id }).users(),

  /* GET group transactions */
  transactions: (parent, args, context) => context.prisma.group({ id: parent.id }).transactions(),

  /* GET list for group */
  lists: (parent, args, context) => context.prisma.group({ id: parent.id }).lists(),

};

module.exports = { Group };
