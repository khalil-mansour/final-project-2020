const Query = {
  users: (context) => context.prisma.users(),
};

module.exports = { Query };
