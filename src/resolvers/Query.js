const Query = {
  /* GET all users */
  users: (root, args, context) => context.prisma.users(),

  /* GET all groups */
  groups: (root, args, context) => context.prisma.groups(),
  
  /* GET all groups */
  addresses: (root, args, context) => context.prisma.addresses(),

  /* GET single group by ID */
  group: (root, args, context) => context.prisma.groups({ id: args.id }),
};

module.exports = { Query };
