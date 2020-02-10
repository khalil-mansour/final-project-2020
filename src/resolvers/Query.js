const Query = {
  users: (root, args, context) => context.prisma.users(),
  user: (root, args, context) => context.prisma.user({ id: args.userId }),
  chatrooms: (root, args, context) => context.prisma.chatrooms(),
};

module.exports = { Query };
