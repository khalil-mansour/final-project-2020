const Query = {
  users: (root, args, context) => context.prisma.users(),
};

module.exports = { Query };
