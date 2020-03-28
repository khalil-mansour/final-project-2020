const Group = {

  /* GET group address */
  address: (parent, args, context) => context.prisma.group({ id: parent.id }).address(),

  /* GET group admin */
  admin: (parent, args, context) => context.prisma.group({ id: parent.id }).admin(),

  /* GET group users */
  users: (parent, args, context) => context.prisma.group({ id: parent.id }).users(),

  chatroom: (parent, args, context) => context.prisma.group({ id: parent.id }).chatroom(),

  /* GET list for group */
  lists: (parent, args, context) => context.prisma.group({ id: parent.id }).lists(),

};

module.exports = { Group };
