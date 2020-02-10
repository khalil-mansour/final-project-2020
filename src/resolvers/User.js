const User = {
  /* GET all groups for user */
  groups: ({ id }, args, context) => context.prisma.user({ id }).groups(),
  /* GET all Chatrooms for user */
  userChatrooms: ({ id }, args, context) => context.prisma.user({ id }).userChatrooms(),
};

module.exports = { User };
