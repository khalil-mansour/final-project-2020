const User = {
  /* GET all groups for user */
  groups: ({ id }, args, context) => context.prisma.user({ id }).groups(),
};

module.exports = { User };
