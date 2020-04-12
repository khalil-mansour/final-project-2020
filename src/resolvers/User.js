const User = {
  /* GET all groups for user */
  groups: (parent, args, context) => context.prisma.user({ id: parent.id }).groups(),
  /* GET all Chatrooms for user */
  userChatrooms: (parent, args, context) => context.prisma.user({ id: parent.id }).userChatrooms(),

  /* GET user transactions */
  transactions: ({ id }, args, context) => context.prisma.user({ id }).transactions(),

  /* GET user contributions */
  contributions: ({ id }, args, context) => context.prisma.user({ id }).contributions(),
};

module.exports = { User };
