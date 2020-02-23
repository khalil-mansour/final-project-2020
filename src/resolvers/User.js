const User = {
  /* GET all groups for user */
  groups: (parent, args, context) => context.prisma.user({ id: parent.id }).groups(),

  /* GET all list for a user */
};

module.exports = { User };
