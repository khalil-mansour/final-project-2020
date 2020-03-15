const Chatroom = {
  /* GET all user for a chatroom */
  userChatroom: (parent, args, context) => context.prisma.chatroom({ id: parent.id }).users(),
};

module.exports = { Chatroom };
