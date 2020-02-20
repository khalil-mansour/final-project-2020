const Group = {

  /* GET group address */
  address: (parent, args, context) => context.prisma.group({ id: parent.id }).address(),

  /* GET group admin */
  admin: (parent, args, context) => context.prisma.group({ id: parent.id }).admin(),

  /* GET group users */
  users: (parent, args, context) => context.prisma.group({ id: parent.id }).users(),

};

module.exports = { Group };
