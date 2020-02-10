const UserChatroom = {
  /* GET all chatroom for userChatroom */
  user: ({ id }, args, context) => context.prisma.userChatroom({ id }).chatroom(),

  /* GET all user for userChatroom */
  chatroom: ({ id }, args, context) => context.prisma.userChatroom({ id }).user(),

};

module.exports = { UserChatroom };
