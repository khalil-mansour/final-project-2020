const User = {
  /* GET all groups for user */
  groups: ({ id }, args, context) => context.prisma.users({ id }).groups,
};

module.exports = { User };
