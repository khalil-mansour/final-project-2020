const Message = {
  /* GET all chatroom for a Message */
  user: ({ id }, args, context) => context.prisma.message({ id }).chatroom(),

  /* GET all user for Message */
  chatroom: ({ id }, args, context) => context.prisma.message({ id }).user(),

};

module.exports = { Message };
