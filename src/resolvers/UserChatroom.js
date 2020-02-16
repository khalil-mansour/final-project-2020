const UserChatroom = {
  /* GET all chatroom for userChatroom */
  user: (parent, args, context) => context.prisma.userChatroom({ id: parent.id }).chatroom(),

  /* GET all user for userChatroom */
  chatroom: (parent, args, context) => context.prisma.userChatroom({ id: parent.id }).user(),

};

module.exports = { UserChatroom };
