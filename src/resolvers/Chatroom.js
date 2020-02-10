const Chatroom = {
  /* GET all user for a chatroom */
  userChatroom: ({ id }, args, context) => context.prisma.chatroom({ id }).userChatroom(),
};

module.exports = { Chatroom };
