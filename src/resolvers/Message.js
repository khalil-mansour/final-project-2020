const Message = {
  /* GET all chatroom for a Message */
  user: (parent, args, context) => context.prisma.message({ id: parent.id }).chatroom(),

  /* GET all user for Message */
  chatroom: (parent, args, context) => context.prisma.message({ id: parent.id }).user(),

};

module.exports = { Message };
