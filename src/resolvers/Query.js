const Query = {
  users: (root ,args ,context) => {
    return context.prisma.users()
  }
};

module.exports = { Query };
