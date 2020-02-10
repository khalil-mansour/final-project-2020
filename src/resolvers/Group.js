const Group = {

  /* GET group address */
  address: (parent, args, context) => context.prisma.group({ id: parent.id }).address(),

  /* GET group admin */
  admin: (parent, args, context) => context.prisma.group({ id: parent.id }).admin(),

  /* GET group members */
  members: (parent, args, context) => context.prisma.group({ id: parent.id }).members(),

  /* GET group transactions */
  transactions: (parent, args, context) => context.prisma.group({ id: parent.id }).transactions(),

};

module.exports = { Group };
