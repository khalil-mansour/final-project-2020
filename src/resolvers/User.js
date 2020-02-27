const User = {
  /* GET all groups for user */
  groups: ({ id }, args, context) => context.prisma.user({ id }).groups(),

  /* GET user transactions */
  transactions: ({ id }, args, context) => context.prisma.user({ id }).transactions(),

  /* GET user contributions */
  contributions: ({ id }, args, context) => context.prisma.user({ id }).contributions(),
};

module.exports = { User };
