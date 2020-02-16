const User = {
  /* GET all groups for user */
  groups: (parent, args, context) => context.prisma.user({ id: parent.id }).groups(),
  /* GET all Chatrooms for user */
  userChatrooms: (parent, args, context) => context.prisma.user({ id: parent.id }).userChatrooms(),
};

module.exports = { User };
